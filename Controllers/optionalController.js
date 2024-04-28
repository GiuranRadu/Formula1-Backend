const User = require('../Models/userModel');



//* Optional routes
exports.pilotStats = async (req, res, next) => {
  try {
    const pilotStats = await User.aggregate([
      {
        $match: { circuits: { $exists: true, $ne: [] } } //! Exclude users with empty circuit array
      },
      {
        $match: { role: { $ne: "full" } } //! Exclude users with role "full"
      },
      {
        $addFields: {  //! Add another field to response 
          // circuitsPresentAt: { $size: "$circuits" }, //!here we add a circuits length (number)
          circuitsPresentAt: "$circuits.name", //!here we add the circuits names
          averageTime: { $sum: "$circuits" }
        }
      },
      {
        $unwind: "$circuits"
      },
      {
        $group: {
          _id: "$_id",
          circuitsPresentAt: { $first: "$circuitsPresentAt" },
          averageTime: { $avg: "$circuits.completionTime" },
          age: { $first: "$age" },
          name: { $first: "$name" },
          team: { $first: "$team" },
        }
      },
      {
        $addFields: {
          averageTime: { $round: ["$averageTime", 1] } //! Round to 2 decimal places
        }
      },
      {
        $sort: { averageTime: 1 } //! SORT by averageTime/age /name/ team  -> 1 = ascending , -1 = descending,
      },
      {
        $project: { //! HERE WE ONLY DISPLAY THE SELECTED fields below (select with 1)
          _id: 1, // Exclude the _id field if you want ->  This field is always selected by default
          averageTime: 1,
          circuitsPresentAt: 1,
          age: 1,
          name: 1,
          team: 1
        }
      }
    ]);
    res.status(200).json({
      status: 'success',
      pilotsNo: pilotStats.length,
      pilotStats,

    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
};


exports.circuitsStats = async (req, res, next) => {
  try {
    const circuitStats = await User.aggregate([
      { $unwind: '$circuits' },
      {
        $group: { 
          _id: '$circuits._id', // Group by circuit _id
          users: { $push: { userId: '$_id', name: '$name', completionTime: '$circuits.completionTime' } },
          circuitName: { $first: '$circuits.name' }, // Include the circuit name
          country: { $first: '$circuits.country' } // Include the country field
        }
      },
      {
        $project: { 
          _id: 0,
          circuitId: '$_id',
          circuitName: 1,
          users: 1,
          country: 1,
          pilotsAttended: { $size: '$users' } 
        }
      },
      { $sort: { pilotsAttended: -1 ,circuitName: 1} } //! sort by pilots number, then by circuit name
    ]);

    res.status(200).json({
      status: 'success',
      circuitLength: circuitStats.length,
      circuitStats,
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: "Some error occurred, try again!"
    });
  }
}



