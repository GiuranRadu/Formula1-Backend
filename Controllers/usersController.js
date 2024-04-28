const User = require('./../Models/userModel');
// const CustomError = require('./../Utils/customError');
const ApiFeatures = require('./../Utils/ApiFeatures');
const Circuit = require('./../Models/circuitModel')
const Team = require('./../Models/teamModel')


exports.getAllUsers = async (req, res, next) => {
  const features = new ApiFeatures(User.find(), req.query).filter().sort().limitFields().paginate();

  let users = await features.query
  res.status(200).json({
    status: 'success',
    count: users.length,
    data: {
      users
    }
  })
}

//* Create user & add user to `TEAMS` collection ,in pilots [...]
exports.createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);

    if (user) {
      const teamName = req.body.team;
      console.log(teamName);

      //* Check if the team already exists
      const existingTeam = await Team.findOne({ name: teamName });

      //* Team exists, add user to the pilots array
      if (existingTeam) {
        existingTeam.pilots.push({
          _id: user._id,
          name: user.name,
          age: user.age,
          country: user.country,
          picture: user.picture,
          // Add other fields as needed, dar trebuie si in SCHEMA
        });

        await existingTeam.save();

        res.status(201).json({
          status: 'success',
          data: {
            user,
            team: existingTeam,
          },
        });
      } else {
        //* If team doesn't exist, create a new team
        const newTeam = await Team.create({
          name: teamName,
          pilots: [
            {
              _id: user._id,
              name: user.name,
              age: user.age,
              country: user.country,
              picture: user.picture,
              // Add other fields as needed, dar trebuie si in SCHEMA
            },
          ],
        });

        res.status(201).json({
          status: 'success',
          data: {
            user,
            team: newTeam,
          },
        });
      }
    } else {
      res.status(404).json({
        message: 'User not created',
      });
    }
  } catch (err) {
    res.status(404).json({
      message: err.message,
    });
    console.log(err.message);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        data: {
          message: 'User with that ID does not exist'
        }
      })
    } else {
      res.status(200).json({
        status: 'success',
        data: {
          user
        }
      })
      console.log('User gasit');
    }
  } catch (error) {
    // Handle unexpected errors
    console.error('Error getting user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error'
    });
  }

}

exports.updateUser = async (req, res, next) => {
  try {

    //* Create an object with only the fields present in the req.body
    const updatedFields = {}; //! EMPTY OBJECT
    if (req.body.name) updatedFields.name = req.body.name; //!here we are adding fields 
    if (req.body.age) updatedFields.age = req.body.age; //!here we are adding fields
    if (req.body.email) updatedFields.email = req.body.email; //!here we are adding fields
    if (req.body.country) updatedFields.country = req.body.country; //!here we are adding fields
    if (req.body.picture) updatedFields.picture = req.body.picture; //!here we are adding fields

    //* Update the user with the selected fields
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updatedFields,  //note: ONLY with completed fields
      { new: true, runValidators: true }
    );

    //* Check if user exists in DB
    if (!updatedUser) {
      const error = new Error('User with that id not found', 404);
      return next(error);
    }

    //* Update `user` in the `TEAMS` collection
    await Team.updateMany(
      { "pilots._id": req.params.id },
      { $set: { "pilots.$": updatedUser } }
    );

    res.status(200).json({
      status: 'success',
      data: {
        updatedUser,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    let userToDeleteId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userToDeleteId);

    if (!deletedUser) {
      //* If user not found, send a 404 response
      return res.status(404).json({
        status: 'fail',
        data: `User with id: ${userToDeleteId} not found`
      });
    }

    //! ------- Remove the `pilot` reference from the `TEAM` collection -> pilots [...] -------
    await Team.updateMany(
      { $pull: { pilots: { _id: userToDeleteId } } }
    )
    //! -----------------------------------------------------------------------

    //* If user is successfully deleted, send a 204 response
    res.status(204).json({
      status: "success",
      data: "User Deleted!"
    });
    console.log('User deleted: ', deletedUser.name);
  } catch (error) {
    // Handle unexpected errors
    console.error('Blab la Error deleting user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error'
    });
  }
};

exports.addCircuitToArray = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        data: {
          message: 'User with that ID does not exist',
        },
      });
    }

    const circuitsToAdd = req.body;

    if (circuitsToAdd.length === 0) {
      res.status(200).json({
        status: 'success',
        message: 'Circuits array is empty, nothing to add'
      })
    }

    for (const circuitData of circuitsToAdd) {
      const { _id: circuitIdToAdd, completionTime } = circuitData;

      if (user.circuits.some(circuit => circuit._id.equals(circuitIdToAdd))) {
        console.log(`Circuit with ID ${circuitIdToAdd} already exists in the user's circuits. Skipping...`);
        continue; // Skip to the next iteration if the circuit already exists
      }

      const circuitToAdd = await Circuit.findById(circuitIdToAdd);

      if (!circuitToAdd) {
        return res.status(404).json({
          status: 'fail',
          data: {
            message: `Circuit with ID ${circuitIdToAdd} does not exist`,
          },
        });
      }

      const circuitWithCompletionTime = {
        _id: circuitToAdd._id,
        name: circuitToAdd.name,
        country: circuitToAdd.country,
        circuitLength: circuitToAdd.circuitLength,
        laps: circuitToAdd.laps,
        completionTime: completionTime,
      };

      user.circuits.push(circuitWithCompletionTime);
      // console.log(user);
    }

    //! Temporarily remove confirmPassword field
    const { confirmPassword, ...userWithoutConfirmPassword } = user.toObject();

    await User.findByIdAndUpdate(userId, userWithoutConfirmPassword, { new: true });

    res.status(200).json({
      status: 'success',
      data: {
        user: userWithoutConfirmPassword,
      },
    });

  } catch (error) {
    console.error('Error adding circuits to user:', error);
    res.status(500).json({
      status: 'error',
      message: error,
    });
  }
};

exports.removeCircuitFromArray = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    const circuitsToRemove = req.body;

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        data: {
          message: 'User with that ID does not exist',
        },
      });
    }

    if (!Array.isArray(circuitsToRemove) || circuitsToRemove.length === 0) {
      return res.status(400).json({
        status: 'fail',
        data: {
          message: 'Invalid or empty circuits array',
        },
      });
    }

    for (const circuitData of circuitsToRemove) {
      const circuitIdToRemove = circuitData._id;
      const circuitToRemove = user.circuits.find(circuit => circuit._id.equals(circuitIdToRemove));

      if (!circuitToRemove) {
        console.log(`Circuit with ID ${circuitIdToRemove} does not exist in the user's circuits. Skipping...`);
        continue; // Skip to the next iteration if the circuit doesn't exist
      }

      //! Remove the circuit with the specified _id from the user's circuits array
      user.circuits = user.circuits.filter(circuit => String(circuit._id) !== String(circuitIdToRemove));
    }

    //! Temporarily remove any fields causing validation issues
    const { confirmPassword, ...userWithoutConfirmPassword } = user.toObject();

    //* Update the user in the database
    await User.findByIdAndUpdate(userId, userWithoutConfirmPassword, { new: true });

    res.status(200).json({
      status: 'success',
      message: 'Circuits were removed successfully',
    });
  } catch (error) {
    console.error('Error removing circuits from user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }
};





