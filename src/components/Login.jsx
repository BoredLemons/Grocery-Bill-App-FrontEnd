import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { requestInit } from '../utility/Authentications';

const Login = () => {
    const { error } = useParams();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState(error ? "Please sign in again" : "");
    const [account, setAccount] = useState({ username: "", password: "" });

    const handleSubmit = (e) => {
        e.preventDefault();
        const { username } = account;

        // Login
        fetch("http://localhost:8090/api/login",
            {
                method: "POST",
                body: new URLSearchParams({
                    ...account
                })
            }
        ).then(res => {
            //-------------------- if authentication is valid. --------------------//
            if (res.ok)
                return res.json();
        }).then(data => {
            getClerk(username, data.access_token);
            localStorage.setItem("tokens", JSON.stringify(data));
        }).catch(error => setErrorMessage("Invalid credentials."));
    }

    //-------------------- This method will set the clerk on the upper state --------------------//
    const getClerk = (username, accessToken) => {
        fetch(`http://localhost:8090/api/shopping-clerk/username/${username}`,
            requestInit(accessToken, "GET")
        ).then(res => {
            return res.json();
        }).then(data => {
            if (data.id) {
                localStorage.setItem("currentClerk", JSON.stringify(data));
                getClerkRole(accessToken, data.id);
            }
        }).catch(error => console.log("Error getting clerk: ", error));
    }

    const getClerkRole = (accessToken, id) => {
        // if clerk id is 1 which means that it is a super admin.
        if (id === 1) {
            navigate("/main", { replace: true });
            return;
        }

        fetch(`http://localhost:8090/api/shopping-clerk/role/${id}`,
            requestInit(accessToken, "GET")
        )
            .then(res => {
                if (res.ok) return res.json();
                else {
                    const basicRole = { value: "BASIC" };
                    localStorage.setItem("role", JSON.stringify(basicRole));
                    navigate("/main", { replace: true });
                }
            })
            .then(data => {
                if (data.id)
                    localStorage.setItem("role", JSON.stringify(data));
                navigate("/main", { replace: true });
            })
            .catch(error => error);
    }

    const handleChange = ({ currentTarget: input }) => {
        const clonedAccount = { ...account };
        clonedAccount[input.name] = input.value;
        setAccount(clonedAccount);
    }

    return (
        <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: "#768A95" }}>
            <div className="card p-3 text-center shadow rounded " style={{ width: "20rem" }}>
                <h1 className="h3">Sign in</h1>
                {errorMessage.length !== 0 &&
                    <div className="alert alert-danger alert-sm">{errorMessage}</div>
                }
                <form onSubmit={handleSubmit}>
                    <div className="form-group mb-2">
                        <input
                            value={account.username}
                            onChange={handleChange}
                            name="username"
                            type="text"
                            className="form-control"
                            id="username"
                            placeholder="Username"
                        />
                    </div>
                    <div className="form-group mb-2">
                        <input
                            value={account.password}
                            onChange={handleChange}
                            name="password"
                            type="password"
                            className="form-control"
                            id="password"
                            placeholder="Password"
                        />
                    </div>
                    <button className="btn btn-primary btn-block w-100">Login</button>
                </form>
            </div>
        </div>
    )
}

export default Login