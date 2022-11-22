import axios from 'axios'

export default class Helper {
    static uploadByUrl(url: string, path: string) {
        return axios
            .get(url, {
                responseType: 'arraybuffer',
            })
            .then(
                (res) => {
                    if (res.status === 200) {
                    }
                },
                (err) => {
                    console.log(err)
                },
            )
    }
}
