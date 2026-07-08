import { getToken } from "../utils/tokenStorage";
import axios from "axios"
export const apiFunction = async (
    api,
    params = [],
    data = {},
    type = "get",
    withAuth = false
) => {
    try {
        const url = `${api}${params.length ? "/" + params.join("/") : ""}`;

        const config = {};

        if (withAuth) {
            const token = await getToken();
            if (token) {
                config.headers = {
                    Authorization: `Bearer ${token}`,
                };
            }
        }

        let response;

        switch (type.toLowerCase()) {
            case "get":
                response = await axios.get(url, config);
                break;

            case "post":
                response = await axios.post(url, data, config);
                break;

            case "patch":
                response = await axios.patch(url, data, config);
                break;

            case "delete":
                response = await axios.delete(url, config);
                break;

            default:
                throw new Error("Invalid request type");
        }

        return response;
    } catch (error) {
        const errorData = error.response?.data || { error: error.message || "Network Error" };
        console.error("API Error:", errorData);
        return errorData;
    }
};