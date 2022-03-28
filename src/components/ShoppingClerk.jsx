import React, { useState, useEffect } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { checkAuthorization, checkToken, requestInit } from '../utility/Authentications';
import TextBox from './common/TextBox';

const ShoppingClerk = () => {
    //-------------------- hooks and variables --------------------//
    const { id } = useParams();
    const accountObject = { firstName: "", lastName: "", username: "", password: "", roleId: "" };
    const [account, setAccount] = useState(accountObject);
    const [roles, setRoles] = useState([]);
    const [errors, setErrors] = useState({});
    const [currentClerkRole, setCurrentClerkRole] = useState();
    const { access_token } = JSON.parse(localStorage.getItem("tokens"));

    //-------------------- onMount --------------------//
    useEffect(() => {
        checkToken();
        checkAuthorization(access_token);
        if (id !== "new")
            getShoppingClerkById();
        getShoppingClerkRoles();
        getCurrentClerkRole();
    }, [id]);

    //-------------------- Methods --------------------//

    const getShoppingClerkById = () => {
        fetch(`http://localhost:8090/api/shopping-clerk/${id}`,
            requestInit(access_token, "GET")
        )
            .then(res => res.json())
            .then(data => {

                if (data.message)
                    window.location.replace("/main/shopping-clerks");

                //------------ if there is a data, get the clerk role ------------//
                if (data) {
                    data.password = "";
                    getShoppingClerkRoleById(data);
                }

            })
            .catch(error => console.log("Get clerk error", error));
    }

    const getShoppingClerkRoles = () => {
        fetch("http://localhost:8090/api/shopping-clerk/role",
            requestInit(access_token, "GET")
        )
            .then(res => res.json())
            .then(data => {
                if (data[0].id)
                    setRoles(data);
            });
    }

    const getShoppingClerkRoleById = (clerkAccount) => {
        fetch(`http://localhost:8090/api/shopping-clerk/role/${id}`,
            requestInit(access_token, "GET")
        )
            .then(res => {
                if (res.ok)
                    return res.json();
            })
            .then(data => {
                if (data) {
                    const clonedAccount = { ...clerkAccount };
                    clonedAccount.roleId = data.id;
                    setAccount(clonedAccount);
                }
            })
            .catch(error => console.log(error));
    }

    const handleOnTextChange = ({ currentTarget: input }) => {
        validatePropery(input);
        const clonedAccount = { ...account };
        clonedAccount[input.name] = input.value;
        setAccount(clonedAccount);
    }

    const validatePropery = ({ name, value }) => {
        const clonedErrors = { ...errors };

        //--------------- first name and last name validation ---------------//
        if (name === "firstName" || name === "lastName") {
            if (!isLengthValid(value, 2, 30))
                clonedErrors[name] = "This field must be atleast 2-30 characters.";
            else delete clonedErrors[name];
        }

        //-------------------- Username --------------------//
        if (name === "username") {
            if (!isLengthValid(value, 6, 15))
                clonedErrors[name] = "This field must be atleast 6-15 characters.";
            else delete clonedErrors[name];
        }

        //-------------------- Role --------------------//
        if (name === "roleId") {
            //-------------------- if field is blank --------------------//
            if (value === "Select role") clonedErrors[name] = "Invalid role";
            else delete clonedErrors[name];
        }

        if (value === "") clonedErrors[name] = "This field must not be blank";

        //-------------------- Password can be null or empty as default. --------------------//
        if (name === "password") {
            if (!isLengthValid(value, 8, 15))
                clonedErrors[name] = "This field must be atleast 8-15 characters.";
            else delete clonedErrors[name];
        }

        setErrors(clonedErrors);
    }

    const isLengthValid = (str, min, max) => {
        return str.length >= min && str.length <= max;
    }

    const handleSubmit = e => {
        e.preventDefault();
        isFieldsValid();
        saveShoppingClerk();
    }

    const isFieldsValid = () => {
        // If updating
        if (id !== "new") {
            if (account.roleId === "Select role")
                return false;
            return true;
        }

        // Check if fields are blank or default.
        if (account.firstName === "" ||
            account.lastName === "" ||
            account.username === "" ||
            account.roleId === "Select role")
            return false;

        const { password } = account;
        if (id === "new" && password === "" || !isLengthValid(password, 8, 15))
            return false;

        if (!isLengthValid(password, 8, 15) && password !== "")
            return false;

        return true;
    }

    const saveShoppingClerk = () => {
        const method = id === "new" ? "POST" : "PUT";
        const clonedAccount = { ...account };
        delete clonedAccount["role"];
        if (clonedAccount.password === "") clonedAccount.password = "PASSWORD";

        fetch(`http://localhost:8090/api/shopping-clerk/`,
            requestInit(access_token, method, clonedAccount)
        )
            .then(res => res.json())
            .then(data => {
                // If theres an error message.
                if (data.message) {
                    const clonedErrors = { ...errors };
                    clonedErrors.onErrorSubmit = data.message;
                    setErrors(clonedErrors);
                }

                if (data.id) {
                    if (currentClerkRole === "SUPER_ADMIN")
                        saveShoppingClerkRole(data.id, account.roleId);
                    else
                        saveShoppingClerkRole(data.id, 1);
                }
            })
            .catch(error => console.log("Saving shopping clerk error: ", error));
    }

    const getCurrentClerkRole = () => {
        const { id: currentClerkId } = JSON.parse(localStorage.getItem("currentClerk"));

        if (currentClerkId === 1) {
            setCurrentClerkRole("SUPER_ADMIN");
            return;
        }

        fetch(`http://localhost:8090/api/shopping-clerk/role/${currentClerkId}`,
            requestInit(access_token, "GET")
        )
            .then(res => res.json())
            .then(data => {
                // if (data.id)
                if (data.id)
                    setCurrentClerkRole(data.value);
            })
            .catch(error => console.log(error));
    }

    const saveShoppingClerkRole = (shoppingClerkId, roleId) => {
        const requestBody = { shoppingClerkId: shoppingClerkId, roleId: parseInt(roleId) };
        fetch("http://localhost:8090/api/shopping-clerk/role/add-to-clerk",
            requestInit(access_token, "POST", requestBody)
        )
            .then(res => {
                if (!res.ok)
                    return res.json();

                // I used location.replace to simulate refresh in shopping-clerks page
                window.location.replace("/main/shopping-clerks");
            })
            .then(data => {
                if (data) console.log("error data: ", data);
            })
            .catch(error => console.log("Saving clerk role:", error));
    }

    //-------------------- render --------------------//
    return (
        <div className="mt-5">
            <div className="container w-75 card shadow rounded p-3 ">
                <div className="w-75 mx-auto">
                    <h3>{id === "new" ? "Create new shopping clerk." : `Shopping clerk id: ${id}`}</h3>
                    {errors.onErrorSubmit && (
                        <div className="alert alert-danger">
                            {errors.onErrorSubmit}
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <TextBox
                            error={errors.firstName}
                            handleOnTextChange={handleOnTextChange}
                            name="firstName"
                            label="First Name"
                            type="text"
                            value={account.firstName}
                        />
                        <TextBox
                            error={errors.lastName}
                            handleOnTextChange={handleOnTextChange}
                            name="lastName"
                            label="Last Name"
                            type="text"
                            value={account.lastName}
                        />
                        <TextBox
                            error={errors.username}
                            handleOnTextChange={handleOnTextChange}
                            name="username"
                            label="Username"
                            type="text"
                            value={account.username}
                        />
                        <TextBox
                            error={errors.password}
                            handleOnTextChange={handleOnTextChange}
                            name="password"
                            label="Password"
                            type="password"
                            value={account.password}
                        />
                        {currentClerkRole === "SUPER_ADMIN" &&
                            <div className="mb-3">
                                <label htmlFor="role" className="form-label">Role</label>
                                <select value={account.roleId} name="roleId" onChange={handleOnTextChange} id="role" className="form-select">
                                    <option>Select role</option>
                                    {roles &&
                                        roles.map(role => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                </select>
                                {errors.roleId &&
                                    (<div className="alert alert-danger">
                                        {errors.roleId}
                                    </div>)
                                }
                            </div>
                        }
                        <button
                            disabled={!isFieldsValid() || Object.keys(errors).length > 0}
                            className="me-2 btn btn-success"
                        >
                            {id === "new" ? "Save" : "Update"}
                        </button>
                        <NavLink
                            className="btn btn-secondary ms-2"
                            to="/main/shopping-clerks/"
                        >
                            Cancel
                        </NavLink>
                    </form>
                </div>
            </div>
        </div >
    )
}

export default ShoppingClerk