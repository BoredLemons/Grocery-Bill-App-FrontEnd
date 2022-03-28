import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuthorization, checkToken, requestInit } from '../utility/Authentications';

const Bill = ({ onHandleReceipt }) => {
    //-------------------- HOOKS AND VARIABLES --------------------//
    const { access_token } = JSON.parse(localStorage.getItem("tokens"));
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [itemsOnBill, setItemsOnBill] = useState([]);

    useEffect(() => {
        checkToken();
        checkAuthorization();
        getItems();
        calculateTotalBill();
    }, [itemsOnBill]);

    //-------------------- METHODS --------------------//
    const getItems = () => {
        fetch("http://localhost:8090/api/items",
            requestInit(access_token, "GET")
        )
            .then(res => res.json())
            .then(data => {
                if (!data.errorMessage)
                    setItems(data);
            })
            .catch(error => console.log(error));
    }

    const getCurrentPrice = (item) => {
        const discountedPrice = (item.price - (item.price * (item.discountPercentage / 100)));
        let price = item.isDiscounted ? discountedPrice : item.price;
        return `$${price}`;
    }

    const handleOnAddItem = (item) => {
        const isItemExist = itemsOnBill.some(itemOnBill => itemOnBill.id === item.id);
        if (isItemExist) return;

        item.quantity = 1;
        setItemsOnBill(prevState => [...prevState, item]);
    }

    const handleOnQuantityChange = (sign, index) => {
        const clonedItemsOnBill = [...itemsOnBill];
        const itemOnBill = clonedItemsOnBill[index];

        if (sign === "+" && itemOnBill.itemStocks > itemOnBill.quantity) itemOnBill.quantity++;
        if (sign === "-" && itemOnBill.quantity > 1) itemOnBill.quantity--;

        setItemsOnBill(clonedItemsOnBill);
    }

    const handleOnItemDelete = (item) => {
        const filteredItemsOnBill = itemsOnBill.filter(itemOnBill => itemOnBill.id !== item.id);
        setItemsOnBill(filteredItemsOnBill);
    }

    const calculateTotalBill = () => {
        if (itemsOnBill.length > 0) {
            //-------------------- calculate total --------------------//
            let total = 0;
            itemsOnBill.forEach(item => {
                const discountedPrice = (item.price - (item.price * (item.discountPercentage / 100)));
                total += !item.isDiscounted ? item.price * item.quantity : item.quantity * discountedPrice;
            })
            itemsOnBill.total = total;
        }
    }

    const handleOnCheckout = () => {
        const { firstName, lastName } = JSON.parse(localStorage.getItem("currentClerk"));
        const groceryBills = [];

        itemsOnBill.forEach(item => {
            const groceryBill = {
                clerkName: `${firstName} ${lastName}`,
                itemName: item.name,
                itemPrice: item.price,
                isDiscounted: item.isDiscounted,
                discountPercentage: item.discountPercentage,
                quantity: item.quantity,
            }
            //-------------------- update stocks --------------------//
            item.itemStocks -= item.quantity;

            fetch("http://localhost:8090/api/items",
                requestInit(access_token, "PUT", item)
            )
                .then(res => res.json())
                .catch(error => console.log(error));

            //-------------------- add item to grocery bills --------------------//
            groceryBills.push(groceryBill);
        })

        //-------------------- save transaction. --------------------//
        fetch("http://localhost:8090/api/grocery-bill/",
            requestInit(access_token, "POST", groceryBills)
        )
            .then(res => {
                // TODO Create success message.
                if (res.ok)
                    navigate("/main/receipt", { replace: true });
                return res.json();
            })
            .catch(error => console.log(error));

        //-------------------- pass to upper state. --------------------//

        onHandleReceipt(itemsOnBill);
    }

    //-------------------- render --------------------//
    return (
        <div className="pt-3 vh-100" style={{ backgroundColor: "#768A95" }}>
            <div className="container">
                <div className="card shadow rounded h-75 p-5">
                    <div className="row">
                        <div className="col-8">
                            <h3 className="text-center">Grocery Bill</h3>
                            <table className="table table-sm">
                                <thead className='thead-dark'>
                                    <tr>
                                        <th>Item name</th>
                                        <th>Price</th>
                                        <th>Quantity</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {itemsOnBill && itemsOnBill.map((item, index) => (
                                        <tr
                                            key={item.id}
                                        >
                                            <td>{item.name}</td>
                                            <td>
                                                ${item.isDiscounted ? (item.price - (item.price * (item.discountPercentage / 100))) : item.price}
                                            </td>
                                            <td>
                                                {item.quantity}
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => handleOnQuantityChange("+", index)}
                                                    className="btn btn-primary btn-sm mx-1"
                                                >
                                                    +
                                                </button>
                                                <button
                                                    onClick={() => handleOnQuantityChange("-", index)}
                                                    className="btn btn-secondary btn-sm mx-1"
                                                >
                                                    -
                                                </button>
                                                <button
                                                    onClick={() => handleOnItemDelete(item)}
                                                    className="btn btn-danger btn-sm mx-1"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    {itemsOnBill.length > 0 && (
                                        <tr>
                                            <td><strong>Total</strong></td>
                                            <td>${itemsOnBill.total}</td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                    )}
                                </tfoot>
                            </table>
                        </div>
                        {/* //-------------------- ITEMS --------------------// */}
                        <div className="col">
                            <h3 className="text-center">Items</h3>
                            <div className="overflow-auto" style={{ height: "50vh" }}>
                                <div className="list-group">
                                    <ul className="list-group">
                                        {items && (
                                            items.map(item => (
                                                <li
                                                    key={item.id}
                                                    className="list-group-item hstack"
                                                >
                                                    <span>
                                                        <strong>{item.name} </strong>
                                                        {`${getCurrentPrice(item)} `}
                                                        {item.isDiscounted && <del className='text-muted'>${item.price}</del>}
                                                    </span>
                                                    <button
                                                        disabled={item.itemStocks === 0}
                                                        onClick={() => handleOnAddItem(item)}
                                                        className="btn btn-primary btn-sm ms-auto"
                                                    >
                                                        <span>&#43;</span>
                                                    </button>
                                                </li>
                                            ))
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        disabled={itemsOnBill.length < 1}
                        onClick={handleOnCheckout}
                        className="btn btn-success w-25 btn-sm mx-auto"
                    >
                        Checkout
                    </button>
                </div>
            </div>
        </div >
    )
}

export default Bill;