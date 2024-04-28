const Circuit = require('../Models/circuitModel')
const User = require('../Models/userModel')
const ApiFeatures = require('./../Utils/ApiFeatures');




exports.getAllCircuits = async (req, res, next) => {
  const features = new ApiFeatures(Circuit.find(), req.query).filter().sort().limitFields().paginate();
  let circuits = await features.query
  res.status(200).json({
    status: 'success',
    count: circuits.length,
    data: {
      circuits
    }
  })
}


exports.createCircuit = async (req, res, next) => {
  try {
    const { userId, ...circuitData } = req.body; //! in case we have a USER which want to add the circuit to it's circuit list array 

    const circuit = await Circuit.create(circuitData);

    await User.findByIdAndUpdate(userId, {
      $push: {
        circuits: {
          _id: circuit._id,
          ...circuit.toObject(),
        },
      },
    });

    res.status(201).json({ status: "success" });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};


exports.getCircuit = async (req, res, next) => {
  try {
    const circuit = await Circuit.findById(req.params.id);

    if (!circuit) {
      return res.status(404).json({
        status: 'fail',
        data: {
          message: 'Circuit with that ID does not exist'
        }
      })
    } else {
      res.status(200).json({
        status: 'success',
        circuit
      })
      console.log('Circuit gasit');
    }

  } catch (error) {
    // Handle unexpected errors
    console.error('Error finding circuit:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error'
    });
  }
}


exports.updateCircuit = async (req, res, next) => {
  try {
    const updatedCircuit = await Circuit.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (!updatedCircuit) {
      throw new Error('Circuit with that id not found');
    }


    // //! -------  Update the `circuit` in the every user in `USERS` collection -------
    // await User.updateMany(
    //   { "circuits._id": req.params.id }, { $set: { "circuits.$": { ...updatedCircuit.toObject() } } }
    // );
    // //! ----------- here we replace all the fields (losing extra ones) ---------------

    
    //! --------  Update the `circuit` in the every user in `USERS` collection ---------
    // Extracting only the fields present in updatedCircuit
    const updatedFields = {};
    Object.keys(updatedCircuit.toObject()).forEach((field) => {
      updatedFields[`circuits.$.${field}`] = updatedCircuit[field];
    });

    await User.updateMany(
      { "circuits._id": req.params.id }, {$set: updatedFields }
    );
    //! ------------- with this we keep untouched all other extra fields ----------------

    res.status(200).json({
      status: 'success',
      data: { updatedCircuit },
    });

  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};


exports.deleteCircuit = async (req, res, next) => {
  try {
    let circuitToDeleteId = req.params.id;
    const deletedCircuit = await Circuit.findByIdAndDelete(circuitToDeleteId);

    if (!deletedCircuit) {
      //* If circuit not found, send a 404 response
      return res.status(404).json({
        status: 'fail',
        data: `User with id: ${circuitToDeleteId} not found`
      });
    }
    //! ------- Remove the `circuit` reference from the `USERS` collection -------
    await User.updateMany(
      { "circuits._id": circuitToDeleteId },
      { $pull: { circuits: { _id: circuitToDeleteId } } }
    );
    //! -----------------------------------------------------------------------

    //* If circuit is successfully deleted, send a 204 response
    res.status(204).json({
      status: "success",
      data: "Circuit Deleted!"
    });
    console.log('Circuit deleted: ', deletedCircuit.name);
  } catch (error) {
    // Handle unexpected errors
    console.error('Error deleting user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error'
    });
  }
}


