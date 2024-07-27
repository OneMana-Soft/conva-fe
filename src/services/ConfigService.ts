import useSWR from "swr";
import axiosInstance from '../utils/AxiosInstance';


interface MqttConfigRes {
    msg: string
    data: MqttConfigInterface
}

interface MqttConfigInterface {
    topics: string[]
    username: string
    password: string
    ws_url: string
    clientId: string
}

class ConfigService {

    static mqttConfigFetcher(url: string): Promise<MqttConfigRes> {
        const fetcher: Promise<MqttConfigRes> =  axiosInstance.get(url).then((response) => response.data);
        return fetcher;
    }

    static chatWithAllComments() {

        const { data, error, isLoading, mutate } = useSWR(
            (`/api/config/mqttConfig`),
            ConfigService.mqttConfigFetcher,
        );

        return {
            data,
            isLoading,
            isError: error,
            mutate
        };
    }

}



export default ConfigService;
