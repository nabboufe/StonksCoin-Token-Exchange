import { useRef, useEffect } from "react";
import { useSelector } from "react-redux";

import { myEventsSelector } from "../store/selectors";

import config from "../config.json";

const Alert = () => {
    const isPending = useSelector(state => state.exchange.transaction.isPending);
    const isSuccessful = useSelector(state => state.exchange.transaction.isSuccessful);
    const isError = useSelector(state => state.exchange.transaction.isError);
    const events = useSelector(myEventsSelector);

    const account = useSelector(state => state.provider.account);
    const chainId = useSelector(state => state.provider.chainId);

    const alertRef = useRef(null);

    useEffect(() => {
        if ((events[0] || isPending || isError) && account) {
            alertRef.current.className = "alert";
        }
    }, [isPending, isError, account, events]);

    const removeHandler = async (e) => {
        alertRef.current.className = "alert alert--remove"
    }

    return (
        <div>
            {
                isPending ? (
                    <div
                        className="alert alert--remove"
                        onClick={removeHandler}
                        ref={alertRef}
                    >
                        <h1>Transaction Pending...</h1>
                    </div>
                ) : !isPending && isSuccessful && events[0] ? (
                    <div
                        className="alert alert--remove"
                        onClick={removeHandler}
                        ref={alertRef}
                    >
                        <h1>Transaction Successful</h1>
                        <a
                            href={config[chainId] ?
                                  `${config[chainId].explorerURL}/tx/${events[0].transactionHash}`
                                  : "#"}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {
                                events[0].transactionHash.slice(0, 5) +
                                "..." +
                                events[0].transactionHash.slice(-4)
                            }
                        </a>
                    </div>
                    ) : !isPending && !isSuccessful && isError ? (
                        <div
                            className="alert alert--remove"
                            onClick={removeHandler}
                            ref={alertRef}
                        >
                            <h1>Transaction Failed</h1>
                        </div>
                    ) : (
                        <div
                            className="alert alert--remove"
                            onClick={removeHandler}
                            ref={alertRef}
                        >
                        </div>
                )
            }
        </div>
    );
}
  
export default Alert;
