import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { checkToken } from '../utility/Authentications';

//-------------------- Components --------------------//
import Bill from './Bill';
import Item from './Item';
import Items from './Items';
import Navbar from './Navbar';
import NotFound from './NotFound';
import Receipt from './Receipt';
import ShoppingClerk from './ShoppingClerk';
import ShoppingClerks from './ShoppingClerks';
import TransactionHistory from './TransactionHistory';
import Unauthorized from './Unauthorized';

const MainPage = () => {
  checkToken();
  const [groceryBill, setGrocerryBill] = useState([]);

  const handleReceipt = (groceryBill) => {
    setGrocerryBill(groceryBill);
  };

  return (
    <div className='vh-100' style={{ backgroundColor: '#768A95' }}>
      <Navbar />
      <Routes>
        <Route
          path='/bill'
          element={<Bill onHandleReceipt={handleReceipt} />}
        />
        <Route
          path='/receipt'
          element={<Receipt groceryBill={groceryBill} />}
        />
        <Route path='/shopping-clerks'>
          <Route path=':id' element={<ShoppingClerk />} />
          <Route path='' element={<ShoppingClerks />} />
        </Route>
        <Route path='/transaction-history'>
          <Route path=':purchaseId' element={<Receipt />} />
          <Route path='' element={<TransactionHistory />} />
        </Route>
        <Route path='/items'>
          <Route path=':id' element={<Item />} />
          <Route path='' element={<Items />} />
        </Route>
        <Route path='/unauthorized' element={<Unauthorized />} />
        <Route
          path='/'
          element={
            <h1 className='text-center text-light display-3 mt-5'>
              Welcome to Grocery Bill.
            </h1>
          }
        />
        <Route path='*' element={<NotFound />} />
        <Route path='/not-found' element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default MainPage;
