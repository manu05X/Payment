import './App.css';
import React, { useState } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';



function App() {
  const [firstname, setfirstname] = useState("")
  const [lastname, setlastname] = useState("")
  const [email, setEmail] = useState("")
  const [amount, setAmount] = useState("")
  const [loading,setLoading] = useState(false)


  const makePayment = async (event) => {
    event.preventDefault()
    setLoading(true)

    let token
    let id
    await axios({
      method: 'post',
      //url: 'http://localhost:5000/token',
      url: window.location.href+'/token',
      data: {
        email: email
      },
    })
      .then((response) => {
        //console.log(response)
        token = response.data.token
        id = response.data.id
        console.log("tokendb", token)
      }).catch((error) => {
        console.log(error)
      })

    console.log('customerId', id)
    window.paysafe.checkout.setup("cHVibGljLTc3NTE6Qi1xYTItMC01ZjAzMWNiZS0wLTMwMmQwMjE1MDA4OTBlZjI2MjI5NjU2M2FjY2QxY2I0YWFiNzkwMzIzZDJmZDU3MGQzMDIxNDUxMGJjZGFjZGFhNGYwM2Y1OTQ3N2VlZjEzZjJhZjVhZDEzZTMwNDQ=", {
      "singleUseCustomerToken": token,
      //"customerId": id,
      "currency": "USD",
      "amount": parseInt(amount) * 100,
      "locale": "en_US",
      "customer": {
        "firstName": firstname,
        "lastName": lastname,
        "email": email,
        "phone": "1234567890",
        "dateOfBirth": {
          "day": 1,
          "month": 7,
          "year": 1990
        }
      },
      "billingAddress": {
        "nickName": "John Dee",
        "street": "20735 Stevens Creek Blvd",
        "street2": "Montessori",
        "city": "Cupertino",
        "zip": "95014",
        "country": "US",
        "state": "CA"
      },
      "environment": "TEST",
      "merchantRefNum": uuidv4(),
      "canEditAmount": false,
      "payoutConfig": {
        "maximumAmount": 100000
      },
      "displayPaymentMethods": ["card"],
      "paymentMethodDetails": {
        "paysafecard": {
          "consumerId": id
        }
      }
    }, function (instance, error, result) {
      if (result && result.paymentHandleToken) {
        console.log(result)
        console.log(result.paymentHandleToken);
        // make AJAX call to Payments API

        axios({
          method: 'post',
          //url: 'http://localhost:5000/payment',
          url: window.location.href+'/payment',
          data:{
            paymentHandleToken: result.paymentHandleToken,
            amount: result.amount,
            merchantRefNum:uuidv4(),
            currencyCode:"USD",
            customerIp: "10.10.12.64",
            description: "Magazine subscription",
            dupCheck: true,
            settleWithAuth: false
          }
        })
          .then((result) => {
            console.log(result)
            if (result.data.data.status == 'COMPLETED') {
              instance.showSuccessScreen('Payment SUCCESSFULL')
            }
            else {
              instance.showFailureScreen('Payment declined .Try with same or another payment method')
            }
            setLoading(false)
          }).catch((error) => {
            console.log(error)
          })
      } else {
        console.error(error);
        // Handle the error
      }
    }, function (stage, expired) {
      switch (stage) {
        case "PAYMENT_HANDLE_NOT_CREATED": // Handle the scenario
        case "PAYMENT_HANDLE_CREATED": // Handle the scenario
        case "PAYMENT_HANDLE_REDIRECT": // Handle the scenario
        case "PAYMENT_HANDLE_PAYABLE": // Handle the scenario
        default: // Handle the scenario
      }
    });

    setTimeout(setLoading(false),10000);

  }


  return (
    <div className="App">
      <div>
        <h2>Paysafe Assignment</h2>
      </div>

      <div className="box">
        <div>
          <label>First name</label>
          <input
            type="text"
            name="firstname"
            placeholder="FIRSTNAME"
            value={firstname}
            onChange={(e) => setfirstname(e.target.value)}
          />
        </div>

        <div>
          <label>Last name</label>
          <input
            type="text"
            name="lastName"
            placeholder="LASTNAME"
            onChange={(e) => setlastname(e.target.value)}
            value={lastname}
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="text"
            name="amount"
            placeholder="EMAIL ADDRESS"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label>Amount</label>
          <input
            type="number"
            name="amount"
            placeholder="AMOUNT"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          ></input>
        </div>

        <div className="buttonsubmit">
          {
            loading ? <div className="loader"></div> : <input type="submit" value="CLICK TO PAY" onClick={makePayment}></input>
          }
          
        </div>

      </div>


    </div>
  );
}

export default App;
