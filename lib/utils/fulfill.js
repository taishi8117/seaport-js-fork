"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdvancedOrderNumeratorDenominator = exports.generateFulfillOrdersFulfillments = exports.fulfillAvailableOrders = exports.validateAndSanitizeFromOrderStatus = exports.fulfillStandardOrder = exports.fulfillBasicOrder = exports.shouldUseBasicFulfill = void 0;
var ethers_1 = require("ethers");
var constants_1 = require("../constants");
var approval_1 = require("./approval");
var balanceAndApprovalCheck_1 = require("./balanceAndApprovalCheck");
var criteria_1 = require("./criteria");
var gcd_1 = require("./gcd");
var item_1 = require("./item");
var order_1 = require("./order");
var usecase_1 = require("./usecase");
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
var shouldUseBasicFulfill = function (_a, totalFilled) {
    var offer = _a.offer, consideration = _a.consideration, offerer = _a.offerer;
    // 1. The order must not be partially filled
    if (!totalFilled.eq(0)) {
        return false;
    }
    // 2. Must be single offer and at least one consideration
    if (offer.length > 1 || consideration.length === 0) {
        return false;
    }
    var allItems = __spreadArray(__spreadArray([], __read(offer), false), __read(consideration), false);
    var nfts = allItems.filter(function (_a) {
        var itemType = _a.itemType;
        return [constants_1.ItemType.ERC721, constants_1.ItemType.ERC1155].includes(itemType);
    });
    var nftsWithCriteria = allItems.filter(function (_a) {
        var itemType = _a.itemType;
        return (0, item_1.isCriteriaItem)(itemType);
    });
    var offersNativeCurrency = (0, item_1.isNativeCurrencyItem)(offer[0]);
    // 3. The order does not offer an item with Ether (or other native tokens) as its item type.
    if (offersNativeCurrency) {
        return false;
    }
    // 4. The order only contains a single ERC721 or ERC1155 item and that item is not criteria-based
    if (nfts.length !== 1 || nftsWithCriteria.length !== 0) {
        return false;
    }
    // 5. All currencies need to have the same address and item type (Native, ERC20)
    if (!(0, order_1.areAllCurrenciesSame)({ offer: offer, consideration: consideration })) {
        return false;
    }
    // 6. All individual items need to have the same startAmount and endAmount
    var differentStartAndEndAmount = allItems.some(function (_a) {
        var startAmount = _a.startAmount, endAmount = _a.endAmount;
        return startAmount !== endAmount;
    });
    if (differentStartAndEndAmount) {
        return false;
    }
    var _b = __read(consideration), firstConsideration = _b[0], restConsideration = _b.slice(1);
    // 7. First consideration item must contain the offerer as the recipient
    var firstConsiderationRecipientIsNotOfferer = firstConsideration.recipient.toLowerCase() !== offerer.toLowerCase();
    if (firstConsiderationRecipientIsNotOfferer) {
        return false;
    }
    // 8. If the order has multiple consideration items and all consideration items other than the
    // first consideration item have the same item type as the offered item, the offered item
    // amount is not less than the sum of all consideration item amounts excluding the
    // first consideration item amount
    if (consideration.length > 1 &&
        restConsideration.every(function (item) { return item.itemType === offer[0].itemType; }) &&
        (0, order_1.totalItemsAmount)(restConsideration).endAmount.gt(offer[0].endAmount)) {
        return false;
    }
    var currencies = allItems.filter(item_1.isCurrencyItem);
    //  9. The token on native currency items needs to be set to the null address and the identifier on
    //  currencies needs to be zero, and the amounts on the 721 item need to be 1
    var nativeCurrencyIsZeroAddress = currencies
        .filter(function (_a) {
        var itemType = _a.itemType;
        return itemType === constants_1.ItemType.NATIVE;
    })
        .every(function (_a) {
        var token = _a.token;
        return token === ethers_1.ethers.constants.AddressZero;
    });
    var currencyIdentifiersAreZero = currencies.every(function (_a) {
        var identifierOrCriteria = _a.identifierOrCriteria;
        return ethers_1.BigNumber.from(identifierOrCriteria).eq(0);
    });
    var erc721sAreSingleAmount = nfts
        .filter(function (_a) {
        var itemType = _a.itemType;
        return itemType === constants_1.ItemType.ERC721;
    })
        .every(function (_a) {
        var endAmount = _a.endAmount;
        return endAmount === "1";
    });
    return (nativeCurrencyIsZeroAddress &&
        currencyIdentifiersAreZero &&
        erc721sAreSingleAmount);
};
exports.shouldUseBasicFulfill = shouldUseBasicFulfill;
var offerAndConsiderationFulfillmentMapping = (_a = {},
    _a[constants_1.ItemType.ERC20] = (_b = {},
        _b[constants_1.ItemType.ERC721] = constants_1.BasicOrderRouteType.ERC721_TO_ERC20,
        _b[constants_1.ItemType.ERC1155] = constants_1.BasicOrderRouteType.ERC1155_TO_ERC20,
        _b),
    _a[constants_1.ItemType.ERC721] = (_c = {},
        _c[constants_1.ItemType.NATIVE] = constants_1.BasicOrderRouteType.ETH_TO_ERC721,
        _c[constants_1.ItemType.ERC20] = constants_1.BasicOrderRouteType.ERC20_TO_ERC721,
        _c),
    _a[constants_1.ItemType.ERC1155] = (_d = {},
        _d[constants_1.ItemType.NATIVE] = constants_1.BasicOrderRouteType.ETH_TO_ERC1155,
        _d[constants_1.ItemType.ERC20] = constants_1.BasicOrderRouteType.ERC20_TO_ERC1155,
        _d),
    _a);
function fulfillBasicOrder(_a) {
    var _b, _c;
    var order = _a.order, seaportContract = _a.seaportContract, offererBalancesAndApprovals = _a.offererBalancesAndApprovals, fulfillerBalancesAndApprovals = _a.fulfillerBalancesAndApprovals, timeBasedItemParams = _a.timeBasedItemParams, offererOperator = _a.offererOperator, fulfillerOperator = _a.fulfillerOperator, signer = _a.signer, _d = _a.tips, tips = _d === void 0 ? [] : _d, _e = _a.conduitKey, conduitKey = _e === void 0 ? constants_1.NO_CONDUIT : _e, domain = _a.domain;
    return __awaiter(this, void 0, void 0, function () {
        var _f, offer, consideration, considerationIncludingTips, offerItem, _g, forOfferer, forAdditionalRecipients, basicOrderRouteType, additionalRecipients, considerationWithoutOfferItemType, totalNativeAmount, insufficientApprovals, basicOrderParameters, payableOverrides, approvalActions, exchangeAction, actions;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    _f = order.parameters, offer = _f.offer, consideration = _f.consideration;
                    considerationIncludingTips = __spreadArray(__spreadArray([], __read(consideration), false), __read(tips), false);
                    offerItem = offer[0];
                    _g = __read(considerationIncludingTips), forOfferer = _g[0], forAdditionalRecipients = _g.slice(1);
                    basicOrderRouteType = (_b = offerAndConsiderationFulfillmentMapping[offerItem.itemType]) === null || _b === void 0 ? void 0 : _b[forOfferer.itemType];
                    if (basicOrderRouteType === undefined) {
                        throw new Error("Order parameters did not result in a valid basic fulfillment");
                    }
                    additionalRecipients = forAdditionalRecipients.map(function (_a) {
                        var startAmount = _a.startAmount, recipient = _a.recipient;
                        return ({
                            amount: startAmount,
                            recipient: recipient,
                        });
                    });
                    considerationWithoutOfferItemType = considerationIncludingTips.filter(function (item) { return item.itemType !== offer[0].itemType; });
                    totalNativeAmount = (_c = (0, item_1.getSummedTokenAndIdentifierAmounts)({
                        items: considerationWithoutOfferItemType,
                        criterias: [],
                        timeBasedItemParams: __assign(__assign({}, timeBasedItemParams), { isConsiderationItem: true }),
                    })[ethers_1.ethers.constants.AddressZero]) === null || _c === void 0 ? void 0 : _c["0"];
                    insufficientApprovals = (0, balanceAndApprovalCheck_1.validateBasicFulfillBalancesAndApprovals)({
                        offer: offer,
                        consideration: considerationIncludingTips,
                        offererBalancesAndApprovals: offererBalancesAndApprovals,
                        fulfillerBalancesAndApprovals: fulfillerBalancesAndApprovals,
                        timeBasedItemParams: timeBasedItemParams,
                        offererOperator: offererOperator,
                        fulfillerOperator: fulfillerOperator,
                    });
                    basicOrderParameters = {
                        offerer: order.parameters.offerer,
                        offererConduitKey: order.parameters.conduitKey,
                        zone: order.parameters.zone,
                        //  Note the use of a "basicOrderType" enum;
                        //  this represents both the usual order type as well as the "route"
                        //  of the basic order (a simple derivation function for the basic order
                        //  type is `basicOrderType = orderType + (4 * basicOrderRoute)`.)
                        basicOrderType: order.parameters.orderType + 4 * basicOrderRouteType,
                        offerToken: offerItem.token,
                        offerIdentifier: offerItem.identifierOrCriteria,
                        offerAmount: offerItem.endAmount,
                        considerationToken: forOfferer.token,
                        considerationIdentifier: forOfferer.identifierOrCriteria,
                        considerationAmount: forOfferer.endAmount,
                        startTime: order.parameters.startTime,
                        endTime: order.parameters.endTime,
                        salt: order.parameters.salt,
                        totalOriginalAdditionalRecipients: order.parameters.consideration.length - 1,
                        signature: order.signature,
                        fulfillerConduitKey: conduitKey,
                        additionalRecipients: additionalRecipients,
                        zoneHash: order.parameters.zoneHash,
                    };
                    payableOverrides = { value: totalNativeAmount };
                    return [4 /*yield*/, (0, approval_1.getApprovalActions)(insufficientApprovals, signer)];
                case 1:
                    approvalActions = _h.sent();
                    exchangeAction = {
                        type: "exchange",
                        transactionMethods: (0, usecase_1.getTransactionMethods)(seaportContract.connect(signer), "fulfillBasicOrder", [basicOrderParameters, payableOverrides], domain),
                    };
                    actions = __spreadArray(__spreadArray([], __read(approvalActions), false), [exchangeAction], false);
                    return [2 /*return*/, {
                            actions: actions,
                            executeAllActions: function () {
                                return (0, usecase_1.executeAllActions)(actions);
                            },
                        }];
            }
        });
    });
}
exports.fulfillBasicOrder = fulfillBasicOrder;
function fulfillStandardOrder(_a) {
    var _b;
    var order = _a.order, _c = _a.unitsToFill, unitsToFill = _c === void 0 ? 0 : _c, totalSize = _a.totalSize, totalFilled = _a.totalFilled, offerCriteria = _a.offerCriteria, considerationCriteria = _a.considerationCriteria, _d = _a.tips, tips = _d === void 0 ? [] : _d, extraData = _a.extraData, seaportContract = _a.seaportContract, offererBalancesAndApprovals = _a.offererBalancesAndApprovals, fulfillerBalancesAndApprovals = _a.fulfillerBalancesAndApprovals, offererOperator = _a.offererOperator, fulfillerOperator = _a.fulfillerOperator, timeBasedItemParams = _a.timeBasedItemParams, conduitKey = _a.conduitKey, recipientAddress = _a.recipientAddress, signer = _a.signer, domain = _a.domain;
    return __awaiter(this, void 0, void 0, function () {
        var orderWithAdjustedFills, _e, offer, consideration, considerationIncludingTips, offerCriteriaItems, considerationCriteriaItems, hasCriteriaItems, totalNativeAmount, insufficientApprovals, payableOverrides, approvalActions, isGift, useAdvanced, orderAccountingForTips, _f, numerator, denominator, exchangeAction, actions;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    orderWithAdjustedFills = unitsToFill
                        ? (0, order_1.mapOrderAmountsFromUnitsToFill)(order, {
                            unitsToFill: unitsToFill,
                            totalFilled: totalFilled,
                            totalSize: totalSize,
                        })
                        : // Else, we adjust the order by the remaining order left to be fulfilled
                            (0, order_1.mapOrderAmountsFromFilledStatus)(order, {
                                totalFilled: totalFilled,
                                totalSize: totalSize,
                            });
                    _e = orderWithAdjustedFills.parameters, offer = _e.offer, consideration = _e.consideration;
                    considerationIncludingTips = __spreadArray(__spreadArray([], __read(consideration), false), __read(tips), false);
                    offerCriteriaItems = offer.filter(function (_a) {
                        var itemType = _a.itemType;
                        return (0, item_1.isCriteriaItem)(itemType);
                    });
                    considerationCriteriaItems = considerationIncludingTips.filter(function (_a) {
                        var itemType = _a.itemType;
                        return (0, item_1.isCriteriaItem)(itemType);
                    });
                    hasCriteriaItems = offerCriteriaItems.length > 0 || considerationCriteriaItems.length > 0;
                    if (offerCriteriaItems.length !== offerCriteria.length ||
                        considerationCriteriaItems.length !== considerationCriteria.length) {
                        throw new Error("You must supply the appropriate criterias for criteria based items");
                    }
                    totalNativeAmount = (_b = (0, item_1.getSummedTokenAndIdentifierAmounts)({
                        items: considerationIncludingTips,
                        criterias: considerationCriteria,
                        timeBasedItemParams: __assign(__assign({}, timeBasedItemParams), { isConsiderationItem: true }),
                    })[ethers_1.ethers.constants.AddressZero]) === null || _b === void 0 ? void 0 : _b["0"];
                    insufficientApprovals = (0, balanceAndApprovalCheck_1.validateStandardFulfillBalancesAndApprovals)({
                        offer: offer,
                        consideration: considerationIncludingTips,
                        offerCriteria: offerCriteria,
                        considerationCriteria: considerationCriteria,
                        offererBalancesAndApprovals: offererBalancesAndApprovals,
                        fulfillerBalancesAndApprovals: fulfillerBalancesAndApprovals,
                        timeBasedItemParams: timeBasedItemParams,
                        offererOperator: offererOperator,
                        fulfillerOperator: fulfillerOperator,
                    });
                    payableOverrides = { value: totalNativeAmount };
                    return [4 /*yield*/, (0, approval_1.getApprovalActions)(insufficientApprovals, signer)];
                case 1:
                    approvalActions = _g.sent();
                    isGift = recipientAddress !== ethers_1.ethers.constants.AddressZero;
                    useAdvanced = Boolean(unitsToFill) || hasCriteriaItems || isGift;
                    orderAccountingForTips = __assign(__assign({}, order), { parameters: __assign(__assign({}, order.parameters), { consideration: __spreadArray(__spreadArray([], __read(order.parameters.consideration), false), __read(tips), false), totalOriginalConsiderationItems: consideration.length }) });
                    _f = (0, exports.getAdvancedOrderNumeratorDenominator)(order, unitsToFill), numerator = _f.numerator, denominator = _f.denominator;
                    exchangeAction = {
                        type: "exchange",
                        transactionMethods: useAdvanced
                            ? (0, usecase_1.getTransactionMethods)(seaportContract.connect(signer), "fulfillAdvancedOrder", [
                                __assign(__assign({}, orderAccountingForTips), { numerator: numerator, denominator: denominator, extraData: extraData !== null && extraData !== void 0 ? extraData : "0x" }),
                                hasCriteriaItems
                                    ? (0, criteria_1.generateCriteriaResolvers)({
                                        orders: [order],
                                        offerCriterias: [offerCriteria],
                                        considerationCriterias: [considerationCriteria],
                                    })
                                    : [],
                                conduitKey,
                                recipientAddress,
                                payableOverrides,
                            ], domain)
                            : (0, usecase_1.getTransactionMethods)(seaportContract.connect(signer), "fulfillOrder", [orderAccountingForTips, conduitKey, payableOverrides], domain),
                    };
                    actions = __spreadArray(__spreadArray([], __read(approvalActions), false), [exchangeAction], false);
                    return [2 /*return*/, {
                            actions: actions,
                            executeAllActions: function () {
                                return (0, usecase_1.executeAllActions)(actions);
                            },
                        }];
            }
        });
    });
}
exports.fulfillStandardOrder = fulfillStandardOrder;
function validateAndSanitizeFromOrderStatus(order, orderStatus) {
    var isValidated = orderStatus.isValidated, isCancelled = orderStatus.isCancelled, totalFilled = orderStatus.totalFilled, totalSize = orderStatus.totalSize;
    if (totalSize.gt(0) && totalFilled.div(totalSize).eq(1)) {
        throw new Error("The order you are trying to fulfill is already filled");
    }
    if (isCancelled) {
        throw new Error("The order you are trying to fulfill is cancelled");
    }
    if (isValidated) {
        // If the order is already validated, manually wipe the signature off of the order to save gas
        return { parameters: __assign({}, order.parameters), signature: "0x" };
    }
    return order;
}
exports.validateAndSanitizeFromOrderStatus = validateAndSanitizeFromOrderStatus;
function fulfillAvailableOrders(_a) {
    var ordersMetadata = _a.ordersMetadata, seaportContract = _a.seaportContract, fulfillerBalancesAndApprovals = _a.fulfillerBalancesAndApprovals, fulfillerOperator = _a.fulfillerOperator, currentBlockTimestamp = _a.currentBlockTimestamp, ascendingAmountTimestampBuffer = _a.ascendingAmountTimestampBuffer, conduitKey = _a.conduitKey, signer = _a.signer, recipientAddress = _a.recipientAddress, domain = _a.domain;
    return __awaiter(this, void 0, void 0, function () {
        var sanitizedOrdersMetadata, ordersMetadataWithAdjustedFills, totalNativeAmount, totalInsufficientApprovals, hasCriteriaItems, addApprovalIfNeeded, payableOverrides, approvalActions, advancedOrdersWithTips, _b, offerFulfillments, considerationFulfillments, exchangeAction, actions;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    sanitizedOrdersMetadata = ordersMetadata.map(function (orderMetadata) { return (__assign(__assign({}, orderMetadata), { order: validateAndSanitizeFromOrderStatus(orderMetadata.order, orderMetadata.orderStatus) })); });
                    ordersMetadataWithAdjustedFills = sanitizedOrdersMetadata.map(function (orderMetadata) { return (__assign(__assign({}, orderMetadata), { 
                        // If we are supplying units to fill, we adjust the order by the minimum of the amount to fill and
                        // the remaining order left to be fulfilled
                        order: orderMetadata.unitsToFill
                            ? (0, order_1.mapOrderAmountsFromUnitsToFill)(orderMetadata.order, {
                                unitsToFill: orderMetadata.unitsToFill,
                                totalFilled: orderMetadata.orderStatus.totalFilled,
                                totalSize: orderMetadata.orderStatus.totalSize,
                            })
                            : // Else, we adjust the order by the remaining order left to be fulfilled
                                (0, order_1.mapOrderAmountsFromFilledStatus)(orderMetadata.order, {
                                    totalFilled: orderMetadata.orderStatus.totalFilled,
                                    totalSize: orderMetadata.orderStatus.totalSize,
                                }) })); });
                    totalNativeAmount = ethers_1.BigNumber.from(0);
                    totalInsufficientApprovals = [];
                    hasCriteriaItems = false;
                    addApprovalIfNeeded = function (orderInsufficientApprovals) {
                        orderInsufficientApprovals.forEach(function (insufficientApproval) {
                            if (!totalInsufficientApprovals.find(function (approval) { return approval.token === insufficientApproval.token; })) {
                                totalInsufficientApprovals.push(insufficientApproval);
                            }
                        });
                    };
                    ordersMetadataWithAdjustedFills.forEach(function (_a) {
                        var _b, _c;
                        var order = _a.order, tips = _a.tips, offerCriteria = _a.offerCriteria, considerationCriteria = _a.considerationCriteria, offererBalancesAndApprovals = _a.offererBalancesAndApprovals, offererOperator = _a.offererOperator;
                        var considerationIncludingTips = __spreadArray(__spreadArray([], __read(order.parameters.consideration), false), __read(tips), false);
                        var timeBasedItemParams = {
                            startTime: order.parameters.startTime,
                            endTime: order.parameters.endTime,
                            currentBlockTimestamp: currentBlockTimestamp,
                            ascendingAmountTimestampBuffer: ascendingAmountTimestampBuffer,
                            isConsiderationItem: true,
                        };
                        totalNativeAmount = totalNativeAmount.add((_c = (_b = (0, item_1.getSummedTokenAndIdentifierAmounts)({
                            items: considerationIncludingTips,
                            criterias: considerationCriteria,
                            timeBasedItemParams: timeBasedItemParams,
                        })[ethers_1.ethers.constants.AddressZero]) === null || _b === void 0 ? void 0 : _b["0"]) !== null && _c !== void 0 ? _c : ethers_1.BigNumber.from(0));
                        var insufficientApprovals = (0, balanceAndApprovalCheck_1.validateStandardFulfillBalancesAndApprovals)({
                            offer: order.parameters.offer,
                            consideration: considerationIncludingTips,
                            offerCriteria: offerCriteria,
                            considerationCriteria: considerationCriteria,
                            offererBalancesAndApprovals: offererBalancesAndApprovals,
                            fulfillerBalancesAndApprovals: fulfillerBalancesAndApprovals,
                            timeBasedItemParams: timeBasedItemParams,
                            offererOperator: offererOperator,
                            fulfillerOperator: fulfillerOperator,
                        });
                        var offerCriteriaItems = order.parameters.offer.filter(function (_a) {
                            var itemType = _a.itemType;
                            return (0, item_1.isCriteriaItem)(itemType);
                        });
                        var considerationCriteriaItems = considerationIncludingTips.filter(function (_a) {
                            var itemType = _a.itemType;
                            return (0, item_1.isCriteriaItem)(itemType);
                        });
                        if (offerCriteriaItems.length !== offerCriteria.length ||
                            considerationCriteriaItems.length !== considerationCriteria.length) {
                            throw new Error("You must supply the appropriate criterias for criteria based items");
                        }
                        addApprovalIfNeeded(insufficientApprovals);
                    });
                    payableOverrides = { value: totalNativeAmount };
                    return [4 /*yield*/, (0, approval_1.getApprovalActions)(totalInsufficientApprovals, signer)];
                case 1:
                    approvalActions = _c.sent();
                    advancedOrdersWithTips = sanitizedOrdersMetadata.map(function (_a) {
                        var order = _a.order, _b = _a.unitsToFill, unitsToFill = _b === void 0 ? 0 : _b, tips = _a.tips, extraData = _a.extraData;
                        var _c = (0, exports.getAdvancedOrderNumeratorDenominator)(order, unitsToFill), numerator = _c.numerator, denominator = _c.denominator;
                        var considerationIncludingTips = __spreadArray(__spreadArray([], __read(order.parameters.consideration), false), __read(tips), false);
                        return __assign(__assign({}, order), { parameters: __assign(__assign({}, order.parameters), { consideration: considerationIncludingTips, totalOriginalConsiderationItems: order.parameters.consideration.length }), numerator: numerator, denominator: denominator, extraData: extraData });
                    });
                    _b = generateFulfillOrdersFulfillments(ordersMetadata), offerFulfillments = _b.offerFulfillments, considerationFulfillments = _b.considerationFulfillments;
                    exchangeAction = {
                        type: "exchange",
                        transactionMethods: (0, usecase_1.getTransactionMethods)(seaportContract.connect(signer), "fulfillAvailableAdvancedOrders", [
                            advancedOrdersWithTips,
                            hasCriteriaItems
                                ? (0, criteria_1.generateCriteriaResolvers)({
                                    orders: ordersMetadata.map(function (_a) {
                                        var order = _a.order;
                                        return order;
                                    }),
                                    offerCriterias: ordersMetadata.map(function (_a) {
                                        var offerCriteria = _a.offerCriteria;
                                        return offerCriteria;
                                    }),
                                    considerationCriterias: ordersMetadata.map(function (_a) {
                                        var considerationCriteria = _a.considerationCriteria;
                                        return considerationCriteria;
                                    }),
                                })
                                : [],
                            offerFulfillments,
                            considerationFulfillments,
                            conduitKey,
                            recipientAddress,
                            advancedOrdersWithTips.length,
                            payableOverrides,
                        ], domain),
                    };
                    actions = __spreadArray(__spreadArray([], __read(approvalActions), false), [exchangeAction], false);
                    return [2 /*return*/, {
                            actions: actions,
                            executeAllActions: function () {
                                return (0, usecase_1.executeAllActions)(actions);
                            },
                        }];
            }
        });
    });
}
exports.fulfillAvailableOrders = fulfillAvailableOrders;
function generateFulfillOrdersFulfillments(ordersMetadata) {
    var hashAggregateKey = function (_a) {
        var sourceOrDestination = _a.sourceOrDestination, _b = _a.operator, operator = _b === void 0 ? "" : _b, token = _a.token, identifier = _a.identifier;
        return "".concat(sourceOrDestination, "-").concat(operator, "-").concat(token, "-").concat(identifier);
    };
    var offerAggregatedFulfillments = {};
    var considerationAggregatedFulfillments = {};
    ordersMetadata.forEach(function (_a, orderIndex) {
        var order = _a.order, offererOperator = _a.offererOperator, offerCriteria = _a.offerCriteria;
        var itemToCriteria = (0, criteria_1.getItemToCriteriaMap)(order.parameters.offer, offerCriteria);
        return order.parameters.offer.forEach(function (item, itemIndex) {
            var _a, _b, _c;
            var aggregateKey = "".concat(hashAggregateKey({
                sourceOrDestination: order.parameters.offerer,
                operator: offererOperator,
                token: item.token,
                identifier: (_b = (_a = itemToCriteria.get(item)) === null || _a === void 0 ? void 0 : _a.identifier) !== null && _b !== void 0 ? _b : item.identifierOrCriteria,
                // We tack on the index to ensure that erc721s can never be aggregated and instead must be in separate arrays
            })).concat((0, item_1.isErc721Item)(item.itemType) ? itemIndex : "");
            offerAggregatedFulfillments[aggregateKey] = __spreadArray(__spreadArray([], __read(((_c = offerAggregatedFulfillments[aggregateKey]) !== null && _c !== void 0 ? _c : [])), false), [
                { orderIndex: orderIndex, itemIndex: itemIndex },
            ], false);
        });
    });
    ordersMetadata.forEach(function (_a, orderIndex) {
        var order = _a.order, considerationCriteria = _a.considerationCriteria, tips = _a.tips;
        var itemToCriteria = (0, criteria_1.getItemToCriteriaMap)(order.parameters.consideration, considerationCriteria);
        return __spreadArray(__spreadArray([], __read(order.parameters.consideration), false), __read(tips), false).forEach(function (item, itemIndex) {
            var _a, _b, _c;
            var aggregateKey = "".concat(hashAggregateKey({
                sourceOrDestination: item.recipient,
                token: item.token,
                identifier: (_b = (_a = itemToCriteria.get(item)) === null || _a === void 0 ? void 0 : _a.identifier) !== null && _b !== void 0 ? _b : item.identifierOrCriteria,
                // We tack on the index to ensure that erc721s can never be aggregated and instead must be in separate arrays
            })).concat((0, item_1.isErc721Item)(item.itemType) ? itemIndex : "");
            considerationAggregatedFulfillments[aggregateKey] = __spreadArray(__spreadArray([], __read(((_c = considerationAggregatedFulfillments[aggregateKey]) !== null && _c !== void 0 ? _c : [])), false), [
                { orderIndex: orderIndex, itemIndex: itemIndex },
            ], false);
        });
    });
    return {
        offerFulfillments: Object.values(offerAggregatedFulfillments),
        considerationFulfillments: Object.values(considerationAggregatedFulfillments),
    };
}
exports.generateFulfillOrdersFulfillments = generateFulfillOrdersFulfillments;
var getAdvancedOrderNumeratorDenominator = function (order, unitsToFill) {
    // Used for advanced order cases
    var maxUnits = (0, item_1.getMaximumSizeForOrder)(order);
    var unitsToFillBn = ethers_1.BigNumber.from(unitsToFill);
    // Reduce the numerator/denominator as optimization
    var unitsGcd = (0, gcd_1.gcd)(unitsToFillBn, maxUnits);
    var numerator = unitsToFill
        ? unitsToFillBn.div(unitsGcd)
        : ethers_1.BigNumber.from(1);
    var denominator = unitsToFill ? maxUnits.div(unitsGcd) : ethers_1.BigNumber.from(1);
    return { numerator: numerator, denominator: denominator };
};
exports.getAdvancedOrderNumeratorDenominator = getAdvancedOrderNumeratorDenominator;
//# sourceMappingURL=fulfill.js.map