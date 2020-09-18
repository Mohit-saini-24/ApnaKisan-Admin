
// Your web app's Firebase configuration


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
    apiKey: "AIzaSyBD1Os8BslXS6JfNjicK8l2FbmI9YtEr1w",
    authDomain: "apnakisan-cfe53.firebaseapp.com",
    databaseURL: "https://apnakisan-cfe53.firebaseio.com",
    projectId: "apnakisan-cfe53",
    storageBucket: "apnakisan-cfe53.appspot.com",
    messagingSenderId: "347167391317",
    appId: "1:347167391317:web:406dc61c8dcef332e69edc",
    measurementId: "G-K959S9TR3H"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

function openAddForm() {
    document.getElementById('addProductForm').style.display = "";
    document.getElementById('displayProducts').style.display = "none";
}
function closeForm() {
    document.getElementById('addProductForm').style.display = "none";
    document.getElementById('displayProducts').style.display = "";
}
function addProductTodb(e) {

    var storageRef = firebase.storage().ref();
    e.preventDefault()
    // File or Blob named mountains.jpg
    var file = document.getElementById('productImage').files[0]

    // Upload file and metadata to the object 'images/mountains.jpg'
    var uploadTask = storageRef.child('images/' + file.name).put(file);

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
        (snapshot) => {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
                case firebase.storage.TaskState.PAUSED: // or 'paused'
                    console.log('Upload is paused');
                    break;
                case firebase.storage.TaskState.RUNNING: // or 'running'
                    console.log('Upload is running');
                    break;
            }
        }, (error) => {

            // A full list of error codes is available at
            // https://firebase.google.com/docs/storage/web/handle-errors
            switch (error.code) {
                case 'storage/unauthorized':
                    console.log('User doesnt have permission to access the object');
                    // User doesn't have permission to access the object
                    break;

                case 'storage/canceled':
                    console.log('User canceled the upload')
                    // User canceled the upload
                    break;


                case 'storage/unknown':
                    console.log('Unknown error occurred, inspect error.serverResponse')
                    // Unknown error occurred, inspect error.serverResponse
                    break;
            }
        }, () => {
            // Upload completed successfully, now we can get the download URL
            uploadTask.snapshot.ref.getDownloadURL().then((url) => {
                console.log('File available at', url);
                const varient = [{
                    varientName: document.getElementById('varientName').value,
                    varientQty: document.getElementById('varientQty').value,
                    discountPrice: document.getElementById('discountPrice').value,
                    priceOriginal: document.getElementById('priceOriginal').value,
                }]
                db.collection('products').doc('All Products').collection('Products').add({
                    category: document.getElementById('category').value,
                    company: document.getElementById('company').value,
                    productName: document.getElementById('name').value,
                    productNameHindi: document.getElementById('nameHindi').value,
                    productDescription: document.getElementById('description').value,
                    sold: 0,
                    productURL: url,
                    varients: varient
                }).then((docRef) => {
                    db.collection('products').doc('search').update({
                        search: firebase.firestore.FieldValue.arrayUnion({
                            company: document.getElementById('company').value,
                            productName: document.getElementById('name').value,
                            productURL: url,
                            productId: docRef.id
                        })
                    }).then(() => {
                        console.log('Successfully updated');
                        // eslint-disable-next-line no-alert
                        alert('Successfully updated')
                        window.location.href = `/product/${document.getElementById('category').value}`
                        return;
                    }).catch(err => {
                        console.log(err)
                        return;
                    })
                    return;
                }).catch(err => {
                    console.log(err)
                    return;
                })
                return;
            }).catch(err => {
                console.log(err)
                return;
            })
        })
}
async function deleteProduct(e) {
    try {
        var productId = e.target.id.split("_")[1];
        // create storage reference from bucket
        var productRef = db.collection('products').doc('All Products').collection('Products').doc(productId)
        var productData = await productRef.get();
        console.log(productData.data().productURL)

        var imageRef = firebase.storage().refFromURL(productData.data().productURL)

        // delete from bucket
        // Delete the file
        await imageRef.delete()

        //delete from from database
        await productRef.delete()

        // retrive search array
        var searchRef = db.collection('products').doc('search')
        var searchData = await searchRef.get();
        console.log(searchData.data().search)

        //delete from search array
        await db.collection('products').doc('search').update({
            // varients: admin.firestore.FieldValue.arrayRemove(varient),
            search: searchData.data().search.filter(name => name.productURL !== productData.data().productURL)
        });
        // eslint-disable-next-line no-alert
        window.location.href = `/product/${productData.data().category}`
    } catch (error) {
        console.log(error)
    }
}
