import React, { useState, useEffect } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { checkAuthorization, checkToken, requestInit } from '../utility/Authentications';
import TextBox from './common/TextBox';

const Item = () => {
    //-------------------- Hooks and variables--------------------//
    const { id } = useParams();
    const itemObject = {
        name: "",
        price: "",
        itemStocks: "",
        isDiscounted: false,
        discountPercentage: ""
    };
    const [item, setItem] = useState(itemObject);
    const [errors, setErrors] = useState({});
    const { access_token } = JSON.parse(localStorage.getItem("tokens"));

    useEffect(() => {
        checkToken();
        checkAuthorization(access_token);

        // if id is for updating item.
        if (id !== "new")
            getItemById();
    }, [id]);

    //-------------------- Methods --------------------//
    const getItemById = () => {
        fetch(`http://localhost:8090/api/items/${id}`,
            requestInit(access_token, "GET")
        )
            .then(res => {
                if (res.ok) return res.json();
            })
            .then(data => {
                setItem(data);
            })
            .catch(error => console.log(error));
    }

    const handleOnTextChange = ({ currentTarget: input }) => {
        validatePropery(input);
        const clonedItem = { ...item };

        if (input.name === "isDiscounted")
            clonedItem[input.name] = !item.isDiscounted;
        else clonedItem[input.name] = input.value;

        setItem(clonedItem);
    }

    const validatePropery = ({ name, value }) => {
        const clonedErrors = { ...errors };
        const intValue = parseInt(value);

        if (name === "name") {
            if (value === "") clonedErrors[name] = "This field must not blank";
            else if (value.length < 2 || value.length > 20)
                clonedErrors[name] = "Name must be 2-20 characters";
            else delete clonedErrors[name];
        }

        if (name === "price") {
            if (value === "") clonedErrors[name] = "This field must not blank.";
            else if (intValue <= 0) clonedErrors[name] = "Price must be at least 1.";
            else delete clonedErrors[name];
        }

        if (name === "itemStocks") {
            if (value === "") clonedErrors[name] = "This field must not blank.";
            else if (intValue < 0) clonedErrors[name] = "Must be at least 1 stock.";
            else delete clonedErrors[name];
        }

        if (name === "discountPercentage") {
            if (value === "") clonedErrors[name] = "This field must not blank.";
            else if (intValue < 1 || intValue > 99) clonedErrors[name] = "Must be atleast 1-99.";
            else delete clonedErrors[name];
        }

        setErrors(clonedErrors);
    }

    const isFieldsValid = () => {
        if (item.name === "")
            return false;

        if (parseInt(item.price) === 0)
            return false;

        if (parseInt(item.itemStocks) === 0) {
            return false;
        }

        if (parseInt(item.discountPercentage) < 1 || parseInt(item.discountPercentage) > 99)
            return false;

        return true;
    }

    const handleSubmit = e => {
        e.preventDefault();
        const method = id === "new" ? "POST" : "PUT";

        // set discount percentage to 0 if it's not discounted.
        if (!item.isDiscounted) item.discountPercentage = 0;

        //-------------------- Save item --------------------//
        fetch("http://localhost:8090/api/items",
            requestInit(access_token, method, item)
        )
            .then(res => {
                if (!res.ok)
                    return res.json();

                // I used location.replace to simulate refresh in items page
                window.location.replace("/main/items");
            })
            .then(data => {
                const clonedErrors = { ...errors };
                clonedErrors.onErrorSubmit = data.message;
                setErrors(clonedErrors);
            })
            .catch(error => console.log(error));
    }

    //-------------------- render --------------------//
    return (
        <div className="mt-5">
            <div className="container w-75 card shadow rounded p-3 ">
                <div className="w-75 mx-auto">
                    <h3>{id === "new" ? "Add New Item" : item.name}</h3>
                    {errors.onErrorSubmit && (
                        <div className="alert alert-danger">
                            {errors.onErrorSubmit}
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <TextBox
                            error={errors.name}
                            handleOnTextChange={handleOnTextChange}
                            name="name"
                            label="Item name"
                            type="text"
                            value={item.name}
                        />
                        <TextBox
                            error={errors.price}
                            handleOnTextChange={handleOnTextChange}
                            name="price"
                            label="Price"
                            type="number"
                            value={item.price}
                        />
                        <TextBox
                            error={errors.itemStocks}
                            handleOnTextChange={handleOnTextChange}
                            name="itemStocks"
                            label="Stocks"
                            type="number"
                            value={item.itemStocks}
                        />
                        {item.isDiscounted && (
                            <TextBox
                                error={errors.discountPercentage}
                                handleOnTextChange={handleOnTextChange}
                                name="discountPercentage"
                                label="Discount %"
                                type="number"
                                value={item.discountPercentage}
                            />
                        )}
                        <div className="form-check mb-3">
                            <input
                                onChange={handleOnTextChange}
                                className="form-check-input"
                                type="checkbox"
                                id="flexCheckDefault"
                                name="isDiscounted"
                                checked={item.isDiscounted}
                            />
                            <label className="form-check-label" htmlFor="flexCheckDefault">
                                Discounted
                            </label>
                        </div>
                        <button
                            disabled={Object.keys(errors).length > 0 || !isFieldsValid()}
                            className="me-2 btn btn-success"
                        >
                            {id === "new" ? "Save" : "Update"}
                        </button>
                        <NavLink
                            className="btn btn-secondary ms-2"
                            to="/main/items/"
                        >
                            Cancel
                        </NavLink>
                    </form>
                </div>
            </div>
        </div >
    )
}

export default Item;