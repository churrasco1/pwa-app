import React, { useState } from 'react';
import { Scanner } from "@yudiel/react-qr-scanner";
import styles from './styles.module.scss';

function QrcodeRead ({ setDataLogin}) {
    const [data, setData ] = useState(null);

    return (
        <div className={styles.qrcodeReader}>
            <Scanner
                onScan={(results) => {
                    if (!results?.length) {
                        return;
                    }

                    const [firstResult] = results;
                    const newResult = firstResult.rawValue.split("&&");
                    const newData = {
                        name: newResult[0],
                        password: newResult[1],
                        isQrCode: true,
                    };
                    setData(newData);
                    setDataLogin(newData);
                }}
                onError={(error) => console.log(error?.message)}
                constraints={{
                    facingMode: "user",
                }}
                scanDelay={300}
                />
                <p>{data?.name ?? 'No result'}</p>
                </div>
    );
}
export default QrcodeRead;
