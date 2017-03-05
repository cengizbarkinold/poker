const {Chair} = require('../model/chair');
const HoldemController = require('../controller/holdemController');

var shortid = require('shortid');


CreateChair = (table) => {
  return new Promise((resolve, reject) => {
    let chairs = [];
    for (var chairOrder = 0; chairOrder < table.numberOfPlayers; chairOrder++) {
      let chair = new Chair({number: chairOrder, table: table});
      chairs.push(chair);
      chair.save().then((chair) => {
        if(chairs.length == table.numberOfPlayers) {
          resolve(chairs);
        }
      });
    }
  });
}

AddPlayerToChair = (player, table, chairId, socket, io) => {
  Chair.findById({_id: chairId}).then((chair) => {
    if(player.chair != null) {
      io.to(socket.id).emit('forPlayer', `Sadece 1 adet sandalya seçebilirsin ${player.name}`);
    } else if(chair.player != null) {
      io.to(socket.id).emit('forPlayer', `Seçmiş olduğunuz sandalye doludur ${player.name}`);
    } else {
      chair.player = player;
      player.chair = chair._id;
      chair.isTaken = true;
      socket.broadcast.to(table._id).emit('forTable', `Sandalyenin biri alındı: ${player.chair}`);
      chair.save().then((chair) => {
        player.save().then((player) => {
          if(!table.isGamePlaying) {
            io.to(socket.id).emit('forPlayer', `Diğer oyuncular bekleniyor ${player.name}`);
            Chair.find({table: table._id, isTaken: true}).then((chairs) => {
              console.log(chairs);
              if(chairs.length >= 2) {
                table.isGamePlaying = true;
                table.save().then((table) => {
                  socket.broadcast.to(table._id).emit('forTable', `Oyun Başladı: ${player.chair}`);
                });
              } else {
                //Burada gelen oyuncuyu hazır oynanan oyuna direkt olarak gönder
              }
            });
          }
        });
      });
    }
  });
}

RemovePlayerFromChair = (player, socket, io) => {
  if(player.chair != null) {
    Chair.findById(player.chair).then((chair)=>{
      chair.player = null;
      chair.isTaken = false;
      player.chair = null;
      chair.save();
      player.save();
    });
  }
}

module.exports = {
  CreateChair,
  AddPlayerToChair,
  RemovePlayerFromChair
}
