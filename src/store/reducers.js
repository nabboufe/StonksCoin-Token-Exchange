export const provider = (state = {}, action) => {
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
    transaction: { isSuccessful: false },
    events: []
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

        default:
            return state;
    }
}
