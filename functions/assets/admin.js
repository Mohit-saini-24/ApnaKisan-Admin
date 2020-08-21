async function fetchOrders() {
    var orders = await db.collection('apnakisanorders').get();
    var ordersRow = document.getElementById('orders_row');
    // var ordersDisp =await orders.docs.map(async order => {
    //     var data = []
    //     var uid = order.data().userid;
    //     var temp = await db.collection('users').doc(uid).get();
    //     var phoneNumber = temp.phoneNumber;
    //     data.push(order);
    //     data.push(phoneNumber);
    //     return data;
    // })
    // console.log(ordersDisp)
    await orders.docs.forEach(async order => {
        var query = await db.collection('users').doc(order.data().userid).get();
        var phoneNumber = query.data().phoneNumber;
        var date;
        if (!order.data().orderTime) {
            date = 'no date'
        } else {
            date = order.data().orderTime.toDate()
        }
        console.log(order.data())
        ordersRow.innerHTML += `
        <div class="col s12">
            <h5>${order.data().orderkey}</h5>
            <h5>${date}</h5>
            <h5>${phoneNumber}</h5>
        </div>
        `
        order.data().orderItems.forEach(item => {
            ordersRow.innerHTML += `
        <div class="col s6">
            <h5>${item.data.productNameHindi}</h5>
            <h5>${item.data.productQty}</h5>
            <h5>${item.data.varientName}</h5>
        </div>
        `
        })
        ordersRow.innerHTML+=`
        <div class="col s12">
            <button class="btn red" onclick="deleteOrder(event)" id="${order.id}">Delete</button>            
        </div>
        `
        ordersRow.innerHTML+=`
        <div class="col s12">
        <button class="btn green" onclick="acceptOrder(event)" id="accept_${order.id}">Accept</button>
        </div>
        `
    });
}

async function deleteOrder(e) {
    var id = e.target.id
    await db.collection('apnakisanorders').doc(id).delete();
    alert('deleted')
    window.location.reload();
}

async function acceptOrder(e) {
    var id = e.target.id.split('_')[1];
    try {
        await db.collection('apnakisanorders').doc(id).update({
            orderConfirmed : true
        })
        alert('order confirmed')       
    } catch (error) {
        alert('error placing order'+error)
    }

}

