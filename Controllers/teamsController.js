const Teams = require('../Models/teamModel');

exports.getAllTeams = async (req, res, next) => {
  try {
    let teams = await Teams.find();

    res.status(200).json({
      status: 'success',
      count: teams.length,
      data: {
        teams
      }
    });
  } catch (error) {
    // Handle errors appropriately
    console.error('Error retrieving teams:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error'
    });
  }
};
