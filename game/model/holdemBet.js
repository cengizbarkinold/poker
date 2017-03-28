let {mongoose} = require('../../database/mongoose');

let holdemBetSchema = new mongoose.Schema({
  value: {
    type: Number
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'holdemMove'
  }
});


let HoldemBet = mongoose.model('holdemBet', holdemBetSchema);

module.exports = {
  HoldemBet
}