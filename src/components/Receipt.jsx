import { useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom"
import { requestInit } from "../utility/Authentications";


const Receipt = ({ groceryBill }) => {
    const { access_token } = JSON.parse(localStorage.getItem("tokens"));
    const { firstName, lastName } = JSON.parse(localStorage.getItem("currentClerk"));
    const navigate = useNavigate();
    const { purchaseId } = useParams();
    const [receipt, setReceipt] = useState([]);

    useEffect(() => {
        if (!groceryBill) {

            if (!purchaseId)
                navigate("/main/bill", { replace: true });

            fetch(`http://localhost:8090/api/grocery-bill/${purchaseId}`,
                requestInit(access_token, "GET")
            )
                .then(res => {
                    if (res.ok) return res.json();
                })
                .then(data => {
                    setReceipt(data);
                })
                .catch(error => console.log(error));
        }
    }, []);

    const calculateTotalPrice = () => {
        if (!receipt) return;
        const total = receipt
            .map(item => {
                if (item.isDiscounted)
                    return (item.itemPrice - (item.itemPrice * (item.discountPercentage / 100))) * item.quantity;

                return item.itemPrice * item.quantity
            })
            .reduce((a, b) => {
                return a + b;
            }, 0);
        return total;
    }


    return (
        <div className="pt-3 vh-100" style={{ backgroundColor: "#768A95" }}>
            <div className="container">
                <div className="card shadow rounded h-75 p-5">
                    <h3 className="text-center ">{groceryBill ? "Checkout Successful" : "Receipt"}</h3>
                    <table className="table w-50 mx-auto">
                        <thead>
                            <tr>
                                <th>Item name</th>
                                <th>Price</th>
                                <th>Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groceryBill && (
                                groceryBill.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.name}</td>
                                        <td>${item.isDiscounted ? (item.price - (item.price * (item.discountPercentage / 100))) * item.quantity : item.price * item.quantity}</td>
                                        <td>{item.quantity}</td>
                                    </tr>
                                ))
                            )}
                            {receipt && (
                                receipt.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.itemName}</td>
                                        <td>${item.isDiscounted ? (item.itemPrice - (item.itemPrice * (item.discountPercentage / 100))) * item.quantity : item.itemPrice * item.quantity}</td>
                                        <td>{item.quantity}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td><strong>Total price</strong></td>
                                {groceryBill && (
                                    <td><strong>${groceryBill.total}</strong></td>
                                )}
                                {purchaseId && (
                                    <td><strong>${calculateTotalPrice()}</strong></td>
                                )}
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                    <div className="text-center mt-3">
                        <h5 className="mb-0">{`${firstName} ${lastName}`}</h5>
                        <p>Shopping Clerk</p>
                        <NavLink
                            to={groceryBill ? "/main/bill" : "/main/transaction-history/"}
                            className="btn btn-success w-25"
                        >
                            Confirm
                        </NavLink>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default Receipt