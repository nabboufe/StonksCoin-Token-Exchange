export const provider = (state = { account: null }, action) => {
    switch (action.type) {
        case 'PROVIDER_LOADED':
            return {
                ...state,
                connection: action.connection
            }
        case 'NETWORK_LOADED':
            return {
                ...state,
                chainId: action.chainId
            }
        case 'ACCOUNT_LOADED':
            return {
                ...state,
                account: action.account
            }
        case 'ACCOUNT_BALANCE_LOADED':
            return {
                ...state,
                balance: action.balance
            }

        default:
            return state;
    }
}

const DEFAULT_TOKEN_STATE = {
    loaded: false,
    contracts: [],
    symbols: []
};

export const tokens = (state = DEFAULT_TOKEN_STATE, action) => {
    switch (action.type) {
        case 'TOKEN_LOADED':
            return {
                ...state,
                loaded: true,
                contracts: [action.token[0], action.token[1]],
                symbols: [action.symbol[0], action.symbol[1]]
            }
        case 'TOKEN1_BALANCE_LOADED':
            return {
                ...state,
                loaded: true,
                balances: [action.walletBalance]
            }
        case 'TOKEN2_BALANCE_LOADED':
            return {
                ...state,
                loaded: true,
                balances: [...state.balances, action.walletBalance]
            }

        default:
            return state;
    }
}

const DEFAULT_EXCHANGE = {
    loaded: false,
    contract: {},
    transaction: { isSuccessful: false, isError: false },
    events: [],
    allOrders: { loaded: false, data: [] },
    cancelledOrders: { loaded: false, data: [] },
    filledOrders: { loaded: false, data: [] }
};

export const exchange = (state = DEFAULT_EXCHANGE, action) => {
    switch (action.type) {
        case 'EXCHANGE_LOADED':
            return {
                ...state,
                loaded: true,
                contract: action.exchange
            }
        case 'EXCHANGE_TOKEN1_BALANCE_LOADED':
            return {
                ...state,
                loaded: true,
                balances: [action.depositBalance]
            }
        case 'EXCHANGE_TOKEN2_BALANCE_LOADED':
            return {
                ...state,
                loaded: true,
                balances: [...state.balances, action.depositBalance]
            }

        case "CANCELLED_ORDERS_LOADED":
            return {
                ...state,
                cancelledOrders: {
                    loaded: true,
                    data: action.cancelledOrders
                }
            }
        case "ALL_ORDERS_LOADED":
            return {
                ...state,
                allOrders: {
                    loaded: true,
                    data: action.allOrders
                }
            }
        case "FILLED_ORDERS_LOADED":
            return {
                ...state,
                filledOrders: {
                    loaded: true,
                    data: action.filledOrders
                }
            }

        case 'TRANSFER_REQUEST':
            return {
                ...state,
                transaction: {
                    transactionType: 'Transfer',
                    isPending: true,
                    isSuccessful: false
                },
                transferInProgress: true
            }
        case 'TRANSFER_SUCCESS':
            return {
                ...state,
                transaction: {
                    transactionType: 'Transfer',
                    isPending: false,
                    isSuccessful: true
                },
                transferInProgress: false,
                events: [action.event, ...state.events] 
            }
        case 'TRANSFER_FAIL':
            return {
                ...state,
                transaction: {
                    transactionType: 'Transfer',
                    isPending: false,
                    isSuccessful: false,
                    isError: true
                },
                transferInProgress: false
            }

        case 'ORDER_REQUEST':
            return {
                ...state,
                transaction: {
                    transactionType: 'Order',
                    isPending: true,
                    isSuccessful: false
                },
                transferInProgress: true
            }
        case 'ORDER_FAIL':
            return {
                ...state,
                transaction: {
                    transactionType: 'Order',
                    isPending: false,
                    isSuccessful: false,
                    isError: true
                },
                transferInProgress: false
            }
        case 'ORDER_SUCCESS':
            let data;
            let index = state.allOrders.data
                .findIndex(order => order.id.toString() === action.order.id.toString());

            if(index === -1) {
                data = [...state.allOrders.data, action.order]
            } else {
                data = state.allOrders.data
            }

            return {
                ...state,
                transaction: {
                    transactionType: 'Order',
                    isPending: false,
                    isSuccessful: true
                },
                transferInProgress: false,
                allOrders: {
                    ...state.allOrders,
                    loaded: true,
                    data,
                },
                events: [action.event, ...state.events]
            }

        default:
            return state;
    }
}
