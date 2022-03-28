import React, { useEffect, useState } from 'react'
import { useNavigate, NavLink, Link } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const { value: currentClerkRole } = JSON.parse(localStorage.getItem("role"));

    const handleOnClick = () => {
        navigate("/login", { replace: true });
        localStorage.setItem("tokens", JSON.stringify({}));
        localStorage.setItem("currentClerk", JSON.stringify({}));
        localStorage.setItem("role", JSON.stringify({}));
    }

    if (currentClerkRole === "BASIC")
        return (
            <div className="w-100 shadow">
                <div className="navbar navbar-expand-sm navbar-dark bg-dark px-3">
                    <Link className="navbar-brand" to="/main">Grocery Bill App</Link>
                    <div className="navbar-nav ms-auto">
                        <NavLink className="nav-item nav-link" to={"/main/items"}>Items</NavLink>
                        <NavLink onClick={handleOnClick} className="nav nav-link text-danger" to="/login">Logout</NavLink>
                    </div>
                </div>
            </div>
        )

    return (
        <div className="w-100 shadow">
            <div className="navbar navbar-expand-sm navbar-dark bg-dark px-3">
                <Link className="navbar-brand" to="/main">Grocery Bill App</Link>
                <div className="navbar-nav ms-auto">
                    <NavLink className="nav-item nav-link" to={"/main/transaction-history"}>Transaction history</NavLink>
                    <NavLink className="nav-item nav-link" to={"/main/bill"}>Bill</NavLink>
                    <NavLink className="nav-item nav-link" to={"/main/items"}>Items</NavLink>
                    <NavLink className="nav-item nav-link" to={"/main/shopping-clerks"}>Shopping Clerk</NavLink>
                    <NavLink onClick={handleOnClick} className="nav nav-link text-danger" to="/login">Logout</NavLink>
                </div>
            </div>
        </div>
    )
}

export default Navbar;