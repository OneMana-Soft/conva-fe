import axiosInstance from "../utils/AxiosInstance.ts";
import {UserDgraphInfoInterface, UserPostgresInfoInterface} from "./ProfileService.ts";
import useSWR from "swr";


interface rawSelfAdminUserProfileResp {
    msg: string
    data: UserPostgresInfoInterface
}

interface rawAllAdminUserProfileResp {
    msg: string
    data: UserPostgresInfoInterface[]
}

interface rawAllUsersListResp {
    msg: string
    data: UserDgraphInfoInterface[]
}

interface createAdminReq {
    user_uuid: string
}

class AdminService {
    private static getSelfAdminProfileFetcher(url: string) :Promise<rawSelfAdminUserProfileResp> {
        return axiosInstance.get(url).then((response) => response.data);
    }

    private static getAllAdminProfileFetcher(url: string) :Promise<rawAllAdminUserProfileResp> {
        return axiosInstance.get(url).then((response) => response.data);
    }

    private static getAllUsersListFetcher(url: string) :Promise<rawAllUsersListResp> {
        return axiosInstance.get(url).then((response) => response.data);
    }

    static getSelfAdminProfile() {

        const { data, error, isLoading, mutate } = useSWR(
            (`/api/admin/getSelfAdminProfile`),
            AdminService.getSelfAdminProfileFetcher,  { revalidateIfStale: false,
                revalidateOnFocus: false,
                revalidateOnReconnect: false}
        );


        return {
            data: data,
            isLoading,
            isError: error,
            mutate
        };
    }

    static getAllAdminProfile() {

        const { data, error, isLoading, mutate } = useSWR(
            (`/api/admin/getAllAdminUsers`),
            AdminService.getAllAdminProfileFetcher,  { revalidateIfStale: false,
                revalidateOnFocus: false,
                revalidateOnReconnect: false}
        );


        return {
            data: data,
            isLoading,
            isError: error,
            mutate
        };
    }

    static getAllUsersList() {

        const { data, error, isLoading, mutate } = useSWR(
            (`/api/admin/getAllUsersList`),
            AdminService.getAllUsersListFetcher,  { revalidateIfStale: false,
                revalidateOnFocus: false,
                revalidateOnReconnect: false}
        );


        return {
            data: data,
            isLoading,
            isError: error,
            mutate
        };
    }

    static createAdmin(data: createAdminReq) {

        return axiosInstance.post('/api/admin/createAdmin', data).then((res) => res);
    }

    static removeAdmin(data: createAdminReq) {

        return axiosInstance.put('/api/admin/removeAdmin', data).then((res) => res);
    }

    static deactivateUser(data: createAdminReq) {

        return axiosInstance.put('/api/admin/deactivateUser', data).then((res) => res);
    }

    static activateUser(data: createAdminReq) {

        return axiosInstance.put('/api/admin/activateUser', data).then((res) => res);
    }

}

export default AdminService
