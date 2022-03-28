// const localToken = JSON.parse(localStorage.getItem("tokens"));

const getNewAccessToken = (refreshToken) => {
    fetch("http://localhost:8090/api/shopping-clerk/refresh-token",
        requestInit(refreshToken, "GET")
    )
        .then(res => res.json())
        .then(data => {
            if (data.refresh_token && data.access_token) {
                localStorage.setItem("tokens", JSON.stringify(data));
                return;
            }

            const { access_token } = JSON.parse(localStorage.getItem("tokens"));
            if (!(access_token)) return;

            // if refresh token is also expired. User is required to login again.
            window.location.replace("/login/invalid-token");
        });
}

// This method check if token is expired. If token expired get new access token.
export const checkToken = () => {
    const { access_token } = JSON.parse(localStorage.getItem("tokens"));

    //-------------------- if there is no access token --------------------//
    if (!access_token) {
        window.location.replace("/login/invalid-token");
        return;
    };
    // test if access token is expired. (DEMO)
    // const access_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtZSIsInJvbGVzIjpbIkJBU0lDIiwiQURNSU4iXSwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4MDkwL2FwaS9zaG9wcGluZy1jbGVyay9yZWZyZXNoLXRva2VuIiwiZXhwIjoxNjQ0ODQ4MDMxfQ.YyrXBWmMiwfXsfeMRxZO9eWsnSulZpkd5Yk8bhpVL9I";

    fetch("http://localhost:8090/api/shopping-clerk/check-token",
        requestInit(access_token, "GET")
    ).then(res => {
        if (res.status === 403) {
            // console.log("Token expired. Getting new access token with refresh token.");
            const { refresh_token } = JSON.parse(localStorage.getItem("tokens"));
            getNewAccessToken(refresh_token);

            // test if refresh token is also expired. (DEMO)
            // getNewAccessToken("eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtZSIsInJvbGVzIjpbIkJBU0lDIiwiQURNSU4iXSwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4MDkwL2FwaS9zaG9wcGluZy1jbGVyay9yZWZyZXNoLXRva2VuIiwiZXhwIjoxNjQ0ODQ4MDMxfQ.YyrXBWmMiwfXsfeMRxZO9eWsnSulZpkd5Yk8bhpVL9I");
            return;
        }
        return res.json();
    }).catch(error => console.log("checkToken error: ", error));
}

//-------------------- This method will check the authorization. --------------------//
export const checkAuthorization = (fallbackUrl = "") => {
    const { access_token } = JSON.parse(localStorage.getItem("tokens"));
    fetch("http://localhost:8090/api/shopping-clerk/", requestInit(access_token, "GET"))
        .then(res => {
            //-------------------- if not authorize --------------------//
            if (!res.ok && res.status === 403) {

                window.location.replace(fallbackUrl ? fallbackUrl : "/main");
            }
        }).catch(errors => {
            console.log("Check authorization error: ", errors);
        });
}

//-------------------- Boiler plate for request init from fetch api --------------------//
export const requestInit = (accessToken, method, bodyObj) => {
    if (!bodyObj)
        return {
            method,
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        }

    return {
        method,
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(bodyObj)
    }
}