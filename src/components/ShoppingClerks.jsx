import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  checkToken,
  checkAuthorization,
  requestInit,
} from '../utility/Authentications';

const ShoppingClerks = () => {
  //-------------------- States --------------------//
  const [shoppingClerks, setShoppingClerks] = useState([]);

  //-------------------- Checking credentials --------------------//
  const urlPathToRequest = 'http://localhost:8090/api/shopping-clerk/';
  const { access_token } = JSON.parse(localStorage.getItem('tokens'));

  useEffect(() => {
    checkAuthorization();
    checkToken();
    //-------------------- Get shopping clerks --------------------//
    getShoppingClerks();
  }, []);

  const getShoppingClerks = () => {
    fetch(urlPathToRequest, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        //-------------------- if there is no error. --------------------//
        if (!data.errorMessage) {
          const currentClerk = JSON.parse(localStorage.getItem('currentClerk'));
          const filteredData = data.filter(
            (item) => item.id !== currentClerk.id && item.id !== 1
          );
          setShoppingClerks(filteredData);
        }
      })
      .catch((errors) => {
        console.log('error getting shopping clerks', errors);
      });
  };

  const handleOnDelete = (id) => {
    fetch(urlPathToRequest + id, requestInit(access_token, 'DELETE')).then(
      (res) => {
        if (res.ok) {
          getShoppingClerks();
          return;
        }
        return res.json();
      }
    );
  };

  return (
    <div className='pt-3 vh-100' style={{ backgroundColor: '#768A95' }}>
      <div className='container'>
        <div className='card shadow rounded h-75 p-5'>
          <h3>List of Shopping Clerk</h3>
          <table className='table table-sm'>
            <thead className='thead-dark'>
              <tr>
                <th>Id</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>User Name</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {shoppingClerks &&
                shoppingClerks.map((clerk) => (
                  <tr key={clerk.id}>
                    <td>{clerk.id}</td>
                    <td>{clerk.firstName}</td>
                    <td>{clerk.lastName}</td>
                    <td>{clerk.username}</td>
                    <td>
                      <Link
                        className='btn btn-primary btn-sm me-2'
                        to={`/main/shopping-clerks/${clerk.id}`}
                      >
                        Update
                      </Link>
                      <button
                        onClick={() => handleOnDelete(clerk.id)}
                        className='btn btn-danger btn-sm'
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <Link
            className='btn btn-primary w-25 ms-auto btn-sm-sm'
            to='/main/shopping-clerks/new'
          >
            New Shopping Clerk
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShoppingClerks;
