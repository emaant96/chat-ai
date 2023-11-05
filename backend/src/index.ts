import {socketService} from "./services/socket.service";
import {ai} from "./apis/model.api";

socketService.onConnection((socket) => {
  console.log(socket.handshake.address);
  socket.on("message", (data: string) => {
    console.log(data)
    ai.askStream([{role: 'user', content: data}], (value, first, last) => {
      socket.emit("message", {text: value, first, last});
    })
  });
})

