import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

export const getUserDataFromCookies = () => {
    const cookies = Cookies.get('jwtToken');
    if (cookies) {
        const decodedToken = jwtDecode(cookies);
        return decodedToken;
    }
    return null;
}