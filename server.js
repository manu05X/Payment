const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const app = express();

const User = require('./model/User');

dotenv.config();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
    }).then(() => 
    {
        console.log("Database is connected ....!")
})

const headers = {
    'Authorization': process.env.AUTH,
    'Simulator': 'EXTERNAL',
    'Content-Type': 'application/json'
};


async function createPaysafeId(email) {
    let paysafeId
    try {
        //console.log(email)
        await axios({
            method: 'post',
            url: 'https://api.test.paysafe.com/paymenthub/v1/customers',
            data: {
                merchantCustomerId: email+uuidv4(),
                locale: "en_US",
                firstName: "Google",
                middleName: "Microsoft",
                lastName: "Apple",
                dateOfBirth: {
                    year: 1981,
                    month: 10,
                    day: 24
                },
                email: email,
                phone: "777-444-8888",
                ip: "192.0.126.111",
                gender: "M",
                nationality: "Indian",
                cellPhone: "777-555-8888"
            },
            headers: headers
        })
        .then((response) => {
            //console.log(response.data)
            paysafeId = response.data.id
        }).catch((error) => {
            console.log(error)
        })

    } catch (error) {
        console.log(error)

    }
    return paysafeId
}

async function createToken(paysafeId,email){
    let token
    try{
        await axios({
            method: 'post',
            url: 'https://api.test.paysafe.com/paymenthub/v1/customers/' + paysafeId + '/singleusecustomertokens',
            data: {
                    merchantRefNum: uuidv4(),
                    paymentTypes: ["CARD"],
            },
            headers: headers
        })
        .then((response) => {
            //console.log(response.data)
            token = response.data.singleUseCustomerToken
        }).catch((error) => {
            console.log(error.response.data)
        })


    } catch(error){
        console.log(error)

    }
    return token
}

app.use("/token", (req, res) => {
    User.findOne({ email: req.body.email }, async (err, user) => {
        if (err) {
            console.log(err)
        } else {

            if (!user) {

                let paysafeId = await createPaysafeId(req.body.email)

                const newUser = {
                    paysafeId: paysafeId,
                    email: req.body.email
                }

                User.create(newUser, async(err, newUser) => {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log("newuser", newUser)
                        let token = await createToken(newUser.paysafeId)
                        res.send({token: token,id: paysafeId})
                    }
                })

            } else {
                console.log("user hai")
                let token = await createToken(user.paysafeId,user.email)
                //console.log(token, user.paysafeId)
                res.send({token: token, id:user.paysafeId})
                    
                
            }

        }
    })

})


async function payment(obj) {
    let result
    try{
        console.log("object",obj)
        await axios({
            method: 'post',
            url: 'https://api.test.paysafe.com/paymenthub/v1/payments',
            data: obj,
            headers: headers
        }).then((response)=>{
            console.log("response is ->",response.data)
            result = response
        }).catch(error => {
            console.log("error's response is ->",error.response.data)
        })
        
      }catch(error){
        console.log("It's catch block ->",error.data.error)
    }
    return result
}

    


app.use("/payment", async (req, res) => {
    //console.log(req.body)
    let obj = req.body
    let result = await payment(obj)
    const data = result.data
    //console.log(data)
    res.send({data:data})
    
});
   
if (process.env.NODE_ENV === "production")
 {
    app.use(express.static(path.join(__dirname, "client", "build")));
    
    app.get("/*", (req, res) => {
        res.sendFile(path.join(__dirname, "client", "build", "index.html"));
    });
}

app.listen(process.env.PORT || 5000, () => {
    console.log("Server is running at port 5000 .....");
});
