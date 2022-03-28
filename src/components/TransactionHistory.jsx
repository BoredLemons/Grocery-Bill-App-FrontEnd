import { useEffect, useState } from "react"
import { Link } from "react-router-dom";
import { requestInit } from "../utility/Authentications";

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const { access_token } = JSON.parse(localStorage.getItem("tokens"));

        fetch("http://localhost:8090/api/grocery-bill/",
            requestInit(access_token, "GET")
        )
            .then(res => res.json())
            .then(data => {
                if (data[0].purchaseId) {
                    // Sort transactions by purchaseId
                    data.sort((a, b) => parseInt(a.purchaseId) - parseInt(b.purchaseId))
                    setTransactions(data);
                }
            })
            .catch(error => error);
    }, []);


    return (
        <div className="pt-3 vh-100" style={{ backgroundColor: "#768A95" }}>
            <div className="container">
                <div className="card shadow rounded h-75 p-5">
                    <h3>Transaction History</h3>
                    <table className="table table-sm">
                        <thead className='thead-dark'>
                            <tr>
                                <th>Purchase Id</th>
                                <th>Shopping Clerk</th>
                                <th>Purchase Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions && (
                                transactions.map(transaction => (
                                    <tr key={transaction.purchaseId}>
                                        <td>
                                            <Link to={`/main/transaction-history/${transaction.purchaseId}`}>
                                                {transaction.purchaseId}
                                            </Link>
                                        </td>
                                        <td>{transaction.clerkName}</td>
                                        <td>{transaction.purchaseDate}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default TransactionHistory