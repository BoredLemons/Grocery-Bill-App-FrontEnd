import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { checkAuthorization, checkToken, requestInit } from '../utility/Authentications';

const Items = () => {
    const { access_token } = JSON.parse(localStorage.getItem("tokens"));
    const { value: currentClerkRole } = JSON.parse(localStorage.getItem("role"));

    checkToken();
    //-------------------- HOOKS --------------------//

    const [items, setItems] = useState([]);

    useEffect(() => {
        getItems();
    }, []);

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

    const handleOnDelete = id => {
        fetch(`http://localhost:8090/api/items/${id}`,
            requestInit(access_token, "DELETE")
        ).then(res => {
            if (res.ok) {
                getItems();
                return;
            }
            return res.json();
        });
    }

    return (
        <div className="pt-3 vh-100" style={{ backgroundColor: "#768A95" }}>
            <div className="container">
                <div className="card shadow rounded h-75 p-5">
                    <h3>List of Items</h3>
                    <table className="table table-sm">
                        <thead className='thead-dark'>
                            <tr>
                                <th>Id</th>
                                <th>ItemName</th>
                                <th>Price</th>
                                <th>Stocks</th>
                                <th>Discounted</th>
                                <th>Discount %</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items && (
                                items.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                        <td>{item.name}</td>
                                        <td>${item.price}</td>
                                        <td>{item.itemStocks}</td>
                                        <td>{item.isDiscounted ? "Yes" : "No"}</td>
                                        <td>{item.discountPercentage}</td>
                                        {currentClerkRole !== "BASIC" &&
                                            <td>
                                                <Link
                                                    className="btn btn-primary btn-sm me-2"
                                                    to={`/main/items/${item.id}`}
                                                >
                                                    Update
                                                </Link>
                                                <button
                                                    onClick={() => handleOnDelete(item.id)}
                                                    className="btn btn-danger btn-sm"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        }
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    {currentClerkRole !== "BASIC" &&
                        <Link
                            className="btn btn-primary w-25 ms-auto btn-sm-sm"
                            to="/main/items/new"
                        >
                            Add New Item
                        </Link>}
                </div>
            </div>
        </div>
    )
}

export default Items