import { BigNumber, BigNumberish, PayableOverrides, providers } from "ethers";
import type { SeaportConfig, CreateOrderAction, CreateOrderInput, DomainRegistryContract, ExchangeAction, InputCriteria, Order, OrderComponents, OrderParameters, OrderStatus, OrderUseCase, OrderWithCounter, TipInputItem, TransactionMethods, ContractMethodReturnType, MatchOrdersFulfillment, SeaportContract, Signer } from "./types";
export declare class Seaport {
    contract: SeaportContract;
    domainRegistry: DomainRegistryContract;
    private provider;
    private signer?;
    private multicallProvider;
    private config;
    private defaultConduitKey;
    readonly OPENSEA_CONDUIT_KEY: string;
    /**
     * @param providerOrSigner - The provider or signer to use for web3-related calls
     * @param considerationConfig - A config to provide flexibility in the usage of Seaport
     */
    constructor(providerOrSigner: providers.JsonRpcProvider | Signer, { overrides, ascendingAmountFulfillmentBuffer, balanceAndApprovalChecksOnOrderCreation, conduitKeyToConduit, }?: SeaportConfig);
    private _getSigner;
    /**
     * Returns the corresponding order type based on whether it allows partial fills and is restricted by zone
     *
     * @param input
     * @param input.allowPartialFills Whether or not the order can be partially filled
     * @param input.restrictedByZone Whether or not the order can only be filled/cancelled by the zone
     * @returns the order type
     */
    private _getOrderTypeFromOrderOptions;
    /**
     * Returns a use case that will create an order.
     * The use case will contain the list of actions necessary to finish creating an order.
     * The list of actions will either be an approval if approvals are necessary
     * or a signature request that will then be supplied into the final Order struct, ready to be fulfilled.
     *
     * @param input
     * @param input.conduitKey The conduitKey key to derive where to source your approvals from. Defaults to 0 which refers to the Seaport contract.
     *                         Another special value is address(1) will refer to the legacy proxy. All other must derive to the specified address.
     * @param input.zone The zone of the order. Defaults to the zero address.
     * @param input.startTime The start time of the order. Defaults to the current unix time.
     * @param input.endTime The end time of the order. Defaults to "never end".
     *                      It is HIGHLY recommended to pass in an explicit end time
     * @param input.offer The items you are willing to offer. This is a condensed version of the Seaport struct OfferItem for convenience
     * @param input.consideration The items that will go to their respective recipients upon receiving your offer.
     * @param input.counter The counter from which to create the order with. Automatically fetched from the contract if not provided
     * @param input.allowPartialFills Whether to allow the order to be partially filled
     * @param input.restrictedByZone Whether the order should be restricted by zone
     * @param input.fees Convenience array to apply fees onto the order. The fees will be deducted from the
     *                   existing consideration items and then tacked on as new consideration items
     * @param input.domain An optional domain to be hashed and included in the first four bytes of the random salt.
     * @param input.salt Arbitrary salt. If not passed in, a random salt will be generated with the first four bytes being the domain hash or empty.
     * @param input.offerer The order's creator address. Defaults to the first address on the provider.
     * @param accountAddress Optional address for which to create the order with
     * @returns a use case containing the list of actions needed to be performed in order to create the order
     */
    createOrder({ conduitKey, zone, startTime, endTime, offer, consideration, counter, allowPartialFills, restrictedByZone, fees, domain, salt, }: CreateOrderInput, accountAddress?: string): Promise<OrderUseCase<CreateOrderAction>>;
    /**
     * Returns the domain data used when signing typed data
     * @returns domain data
     */
    private _getDomainData;
    /**
     * Returns a raw message to be signed using EIP-712
     * @param orderParameters order parameter struct
     * @param counter counter of the order
     * @returns JSON string of the message to be signed
     */
    private _getMessageToSign;
    /**
     * Submits a request to your provider to sign the order. Signed orders are used for off-chain order books.
     * @param orderParameters standard order parameter struct
     * @param counter counter of the offerer
     * @param accountAddress optional account address from which to sign the order with.
     * @returns the order signature
     */
    signOrder(orderParameters: OrderParameters, counter: number, accountAddress?: string): Promise<string>;
    /**
     * Cancels a list of orders so that they are no longer fulfillable.
     *
     * @param orders list of order components
     * @param accountAddress optional account address from which to cancel the orders from.
     * @param domain optional domain to be hashed and appended to calldata
     * @returns the set of transaction methods that can be used
     */
    cancelOrders(orders: OrderComponents[], accountAddress?: string, domain?: string): TransactionMethods<ContractMethodReturnType<SeaportContract, "cancel">>;
    /**
     * Bulk cancels all existing orders for a given account
     * @param offerer the account to bulk cancel orders on
     * @param domain optional domain to be hashed and appended to calldata
     * @returns the set of transaction methods that can be used
     */
    bulkCancelOrders(offerer?: string, domain?: string): TransactionMethods<ContractMethodReturnType<SeaportContract, "incrementCounter">>;
    /**
     * Approves a list of orders on-chain. This allows accounts to fulfill the order without requiring
     * a signature. Can also check if an order is valid using `callStatic`
     * @param orders list of order structs
     * @param accountAddress optional account address to approve orders.
     * @param domain optional domain to be hashed and appended to calldata
     * @returns the set of transaction methods that can be used
     */
    validate(orders: Order[], accountAddress?: string, domain?: string): TransactionMethods<ContractMethodReturnType<SeaportContract, "validate">>;
    /**
     * Returns the order status given an order hash
     * @param orderHash the hash of the order
     * @returns an order status struct
     */
    getOrderStatus(orderHash: string): Promise<OrderStatus>;
    /**
     * Gets the counter of a given offerer
     * @param offerer the offerer to get the counter of
     * @returns counter as a number
     */
    getCounter(offerer: string): Promise<number>;
    /**
     * Calculates the order hash of order components so we can forgo executing a request to the contract
     * This saves us RPC calls and latency.
     */
    getOrderHash: (orderComponents: OrderComponents) => string;
    /**
     * Fulfills an order through either the basic method or the standard method
     * Units to fill are denominated by the max possible size of the order, which is the greatest common denominator (GCD).
     * We expose a helper to get this: getMaximumSizeForOrder
     * i.e. If the maximum size of an order is 4, supplying 2 as the units to fulfill will fill half of the order: ;
     * @param input
     * @param input.order The standard order struct
     * @param input.unitsToFill the number of units to fill for the given order. Only used if you wish to partially fill an order
     * @param input.offerCriteria an array of criteria with length equal to the number of offer criteria items
     * @param input.considerationCriteria an array of criteria with length equal to the number of consideration criteria items
     * @param input.tips an array of optional condensed consideration items to be added onto a fulfillment
     * @param input.extraData extra data supplied to the order
     * @param input.accountAddress optional address from which to fulfill the order from
     * @param input.conduitKey the conduitKey to source approvals from
     * @param input.recipientAddress optional recipient to forward the offer to as opposed to the fulfiller.
     *                               Defaults to the zero address which means the offer goes to the fulfiller
     * @param input.domain optional domain to be hashed and appended to calldata
     * @returns a use case containing the set of approval actions and fulfillment action
     */
    fulfillOrder({ order, unitsToFill, offerCriteria, considerationCriteria, tips, extraData, accountAddress, conduitKey, recipientAddress, domain, }: {
        order: OrderWithCounter;
        unitsToFill?: BigNumberish;
        offerCriteria?: InputCriteria[];
        considerationCriteria?: InputCriteria[];
        tips?: TipInputItem[];
        extraData?: string;
        accountAddress?: string;
        conduitKey?: string;
        recipientAddress?: string;
        domain?: string;
    }): Promise<OrderUseCase<ExchangeAction<ContractMethodReturnType<SeaportContract, "fulfillBasicOrder" | "fulfillOrder" | "fulfillAdvancedOrder">>>>;
    /**
     * Fulfills an order through best-effort fashion. Orders that fail will not revert the whole transaction
     * unless there's an issue with approvals or balance checks
     * @param input
     * @param input.fulfillOrderDetails list of helper order details
     * @param input.accountAddress the account to fulfill orders on
     * @param input.conduitKey the key from which to source approvals from
     * @param input.recipientAddress optional recipient to forward the offer to as opposed to the fulfiller.
     *                               Defaults to the zero address which means the offer goes to the fulfiller
     * @param input.domain optional domain to be hashed and appended to calldata
     * @returns a use case containing the set of approval actions and fulfillment action
     */
    fulfillOrders({ fulfillOrderDetails, accountAddress, conduitKey, recipientAddress, domain, }: {
        fulfillOrderDetails: {
            order: OrderWithCounter;
            unitsToFill?: BigNumberish;
            offerCriteria?: InputCriteria[];
            considerationCriteria?: InputCriteria[];
            tips?: TipInputItem[];
            extraData?: string;
        }[];
        accountAddress?: string;
        conduitKey?: string;
        recipientAddress?: string;
        domain?: string;
    }): Promise<OrderUseCase<ExchangeAction<[boolean[], import("./typechain/Seaport").ExecutionStructOutput[]] & {
        availableOrders: boolean[];
        executions: import("./typechain/Seaport").ExecutionStructOutput[];
    }>>>;
    /**
     * NOTE: Largely incomplete. Does NOT do any balance or approval checks.
     * Just exposes the bare bones matchOrders where clients will have to supply
     * their own overrides as needed.
     * @param input
     * @param input.orders the list of orders to match
     * @param input.fulfillments the list of fulfillments to match offer and considerations
     * @param input.overrides any overrides the client wants, will need to pass in value for matching orders with ETH.
     * @param input.accountAddress Optional address for which to match the order with
     * @param input.domain optional domain to be hashed and appended to calldata
     * @returns set of transaction methods for matching orders
     */
    matchOrders({ orders, fulfillments, overrides, accountAddress, domain, }: {
        orders: (OrderWithCounter | Order)[];
        fulfillments: MatchOrdersFulfillment[];
        overrides?: PayableOverrides;
        accountAddress?: string;
        domain?: string;
    }): TransactionMethods<ContractMethodReturnType<SeaportContract, "matchOrders">>;
    setDomain(domain: string, accountAddress?: string): TransactionMethods<ContractMethodReturnType<DomainRegistryContract, "setDomain">>;
    getNumberOfDomains(tag: string): Promise<BigNumber>;
    getDomain(tag: string, index: number): Promise<string>;
    getDomains(tag: string, shouldThrow?: boolean): Promise<string[]>;
}
