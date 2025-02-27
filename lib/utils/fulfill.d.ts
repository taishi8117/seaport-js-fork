import { BigNumber, BigNumberish, Signer } from "ethers";
import type { Seaport as SeaportContract, Seaport, FulfillmentComponentStruct } from "../typechain/Seaport";
import type { ConsiderationItem, ExchangeAction, InputCriteria, Order, OrderParameters, OrderStatus, OrderUseCase, ContractMethodReturnType } from "../types";
import { BalancesAndApprovals } from "./balanceAndApprovalCheck";
import { TimeBasedItemParams } from "./item";
/**
 * We should use basic fulfill order if the order adheres to the following criteria:
 * 1. The order should not be partially filled.
 * 2. The order only contains a single offer item and contains at least one consideration item
 * 3. The order does not offer an item with Ether (or other native tokens) as its item type.
 * 4. The order only contains a single ERC721 or ERC1155 item and that item is not criteria-based
 * 5. All other items have the same Native or ERC20 item type and token
 * 6. All items have the same startAmount and endAmount
 * 7. First consideration item must contain the offerer as the recipient
 * 8. If the order has multiple consideration items and all consideration items other than the
 *    first consideration item have the same item type as the offered item, the offered item
 *    amount is not less than the sum of all consideration item amounts excluding the
 *    first consideration item amount
 * 9. The token on native currency items needs to be set to the null address and the identifier on
 *    currencies needs to be zero, and the amounts on the 721 item need to be 1
 */
export declare const shouldUseBasicFulfill: ({ offer, consideration, offerer }: OrderParameters, totalFilled: OrderStatus["totalFilled"]) => boolean;
export declare function fulfillBasicOrder({ order, seaportContract, offererBalancesAndApprovals, fulfillerBalancesAndApprovals, timeBasedItemParams, offererOperator, fulfillerOperator, signer, tips, conduitKey, domain, }: {
    order: Order;
    seaportContract: Seaport;
    offererBalancesAndApprovals: BalancesAndApprovals;
    fulfillerBalancesAndApprovals: BalancesAndApprovals;
    timeBasedItemParams: TimeBasedItemParams;
    offererOperator: string;
    fulfillerOperator: string;
    signer: Signer;
    tips?: ConsiderationItem[];
    conduitKey: string;
    domain?: string;
}): Promise<OrderUseCase<ExchangeAction<ContractMethodReturnType<SeaportContract, "fulfillBasicOrder">>>>;
export declare function fulfillStandardOrder({ order, unitsToFill, totalSize, totalFilled, offerCriteria, considerationCriteria, tips, extraData, seaportContract, offererBalancesAndApprovals, fulfillerBalancesAndApprovals, offererOperator, fulfillerOperator, timeBasedItemParams, conduitKey, recipientAddress, signer, domain, }: {
    order: Order;
    unitsToFill?: BigNumberish;
    totalFilled: BigNumber;
    totalSize: BigNumber;
    offerCriteria: InputCriteria[];
    considerationCriteria: InputCriteria[];
    tips?: ConsiderationItem[];
    extraData?: string;
    seaportContract: Seaport;
    offererBalancesAndApprovals: BalancesAndApprovals;
    fulfillerBalancesAndApprovals: BalancesAndApprovals;
    offererOperator: string;
    fulfillerOperator: string;
    conduitKey: string;
    recipientAddress: string;
    timeBasedItemParams: TimeBasedItemParams;
    signer: Signer;
    domain?: string;
}): Promise<OrderUseCase<ExchangeAction<ContractMethodReturnType<SeaportContract, "fulfillAdvancedOrder" | "fulfillOrder">>>>;
export declare function validateAndSanitizeFromOrderStatus(order: Order, orderStatus: OrderStatus): Order;
export type FulfillOrdersMetadata = {
    order: Order;
    unitsToFill?: BigNumberish;
    orderStatus: OrderStatus;
    offerCriteria: InputCriteria[];
    considerationCriteria: InputCriteria[];
    tips: ConsiderationItem[];
    extraData: string;
    offererBalancesAndApprovals: BalancesAndApprovals;
    offererOperator: string;
}[];
export declare function fulfillAvailableOrders({ ordersMetadata, seaportContract, fulfillerBalancesAndApprovals, fulfillerOperator, currentBlockTimestamp, ascendingAmountTimestampBuffer, conduitKey, signer, recipientAddress, domain, }: {
    ordersMetadata: FulfillOrdersMetadata;
    seaportContract: Seaport;
    fulfillerBalancesAndApprovals: BalancesAndApprovals;
    fulfillerOperator: string;
    currentBlockTimestamp: number;
    ascendingAmountTimestampBuffer: number;
    conduitKey: string;
    signer: Signer;
    recipientAddress: string;
    domain?: string;
}): Promise<OrderUseCase<ExchangeAction<ContractMethodReturnType<SeaportContract, "fulfillAvailableAdvancedOrders">>>>;
export declare function generateFulfillOrdersFulfillments(ordersMetadata: FulfillOrdersMetadata): {
    offerFulfillments: FulfillmentComponentStruct[];
    considerationFulfillments: FulfillmentComponentStruct[];
};
export declare const getAdvancedOrderNumeratorDenominator: (order: Order, unitsToFill?: BigNumberish) => {
    numerator: BigNumber;
    denominator: BigNumber;
};
