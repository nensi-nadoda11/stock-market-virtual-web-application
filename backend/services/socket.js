io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('subscribeBid', async (symbol) => {
    const pendingOrders = await Order.find({ stockSymbol: symbol, status: 'PENDING' }).sort({ placedAt: 1 });
    socket.emit('bidList', pendingOrders);
  });
});
