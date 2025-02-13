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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Seaport = void 0;
var multicall_1 = require("@0xsequence/multicall");
var ethers_1 = require("ethers");
var utils_1 = require("ethers/lib/utils");
var DomainRegistry_1 = require("./abi/DomainRegistry");
var Seaport_1 = require("./abi/Seaport");
var constants_1 = require("./constants");
var approval_1 = require("./utils/approval");
var balanceAndApprovalCheck_1 = require("./utils/balanceAndApprovalCheck");
var fulfill_1 = require("./utils/fulfill");
var item_1 = require("./utils/item");
var order_1 = require("./utils/order");
var usecase_1 = require("./utils/usecase");
var Seaport = /** @class */ (function () {
    /**
     * @param providerOrSigner - The provider or signer to use for web3-related calls
     * @param considerationConfig - A config to provide flexibility in the usage of Seaport
     */
    function Seaport(providerOrSigner, _a) {
        var _b;
        var _c = _a === void 0 ? {} : _a, overrides = _c.overrides, 
        // Five minute buffer
        _d = _c.ascendingAmountFulfillmentBuffer, 
        // Five minute buffer
        ascendingAmountFulfillmentBuffer = _d === void 0 ? 300 : _d, _e = _c.balanceAndApprovalChecksOnOrderCreation, balanceAndApprovalChecksOnOrderCreation = _e === void 0 ? true : _e, conduitKeyToConduit = _c.conduitKeyToConduit;
        var _f, _g, _h;
        this.OPENSEA_CONDUIT_KEY = constants_1.OPENSEA_CONDUIT_KEY;
        /**
         * Calculates the order hash of order components so we can forgo executing a request to the contract
         * This saves us RPC calls and latency.
         */
        this.getOrderHash = function (orderComponents) {
            var offerItemTypeString = "OfferItem(uint8 itemType,address token,uint256 identifierOrCriteria,uint256 startAmount,uint256 endAmount)";
            var considerationItemTypeString = "ConsiderationItem(uint8 itemType,address token,uint256 identifierOrCriteria,uint256 startAmount,uint256 endAmount,address recipient)";
            var orderComponentsPartialTypeString = "OrderComponents(address offerer,address zone,OfferItem[] offer,ConsiderationItem[] consideration,uint8 orderType,uint256 startTime,uint256 endTime,bytes32 zoneHash,uint256 salt,bytes32 conduitKey,uint256 counter)";
            var orderTypeString = "".concat(orderComponentsPartialTypeString).concat(considerationItemTypeString).concat(offerItemTypeString);
            var offerItemTypeHash = ethers_1.ethers.utils.keccak256(ethers_1.ethers.utils.toUtf8Bytes(offerItemTypeString));
            var considerationItemTypeHash = ethers_1.ethers.utils.keccak256(ethers_1.ethers.utils.toUtf8Bytes(considerationItemTypeString));
            var orderTypeHash = ethers_1.ethers.utils.keccak256(ethers_1.ethers.utils.toUtf8Bytes(orderTypeString));
            var offerHash = ethers_1.ethers.utils.keccak256("0x" +
                orderComponents.offer
                    .map(function (offerItem) {
                    return ethers_1.ethers.utils
                        .keccak256("0x" +
                        [
                            offerItemTypeHash.slice(2),
                            offerItem.itemType.toString().padStart(64, "0"),
                            offerItem.token.slice(2).padStart(64, "0"),
                            ethers_1.ethers.BigNumber.from(offerItem.identifierOrCriteria)
                                .toHexString()
                                .slice(2)
                                .padStart(64, "0"),
                            ethers_1.ethers.BigNumber.from(offerItem.startAmount)
                                .toHexString()
                                .slice(2)
                                .padStart(64, "0"),
                            ethers_1.ethers.BigNumber.from(offerItem.endAmount)
                                .toHexString()
                                .slice(2)
                                .padStart(64, "0"),
                        ].join(""))
                        .slice(2);
                })
                    .join(""));
            var considerationHash = ethers_1.ethers.utils.keccak256("0x" +
                orderComponents.consideration
                    .map(function (considerationItem) {
                    return ethers_1.ethers.utils
                        .keccak256("0x" +
                        [
                            considerationItemTypeHash.slice(2),
                            considerationItem.itemType.toString().padStart(64, "0"),
                            considerationItem.token.slice(2).padStart(64, "0"),
                            ethers_1.ethers.BigNumber.from(considerationItem.identifierOrCriteria)
                                .toHexString()
                                .slice(2)
                                .padStart(64, "0"),
                            ethers_1.ethers.BigNumber.from(considerationItem.startAmount)
                                .toHexString()
                                .slice(2)
                                .padStart(64, "0"),
                            ethers_1.ethers.BigNumber.from(considerationItem.endAmount)
                                .toHexString()
                                .slice(2)
                                .padStart(64, "0"),
                            considerationItem.recipient.slice(2).padStart(64, "0"),
                        ].join(""))
                        .slice(2);
                })
                    .join(""));
            var derivedOrderHash = ethers_1.ethers.utils.keccak256("0x" +
                [
                    orderTypeHash.slice(2),
                    orderComponents.offerer.slice(2).padStart(64, "0"),
                    orderComponents.zone.slice(2).padStart(64, "0"),
                    offerHash.slice(2),
                    considerationHash.slice(2),
                    orderComponents.orderType.toString().padStart(64, "0"),
                    ethers_1.ethers.BigNumber.from(orderComponents.startTime)
                        .toHexString()
                        .slice(2)
                        .padStart(64, "0"),
                    ethers_1.ethers.BigNumber.from(orderComponents.endTime)
                        .toHexString()
                        .slice(2)
                        .padStart(64, "0"),
                    orderComponents.zoneHash.slice(2),
                    orderComponents.salt.slice(2).padStart(64, "0"),
                    orderComponents.conduitKey.slice(2).padStart(64, "0"),
                    ethers_1.ethers.BigNumber.from(orderComponents.counter)
                        .toHexString()
                        .slice(2)
                        .padStart(64, "0"),
                ].join(""));
            return derivedOrderHash;
        };
        var provider = providerOrSigner instanceof ethers_1.providers.Provider
            ? providerOrSigner
            : providerOrSigner.provider;
        this.signer = providerOrSigner._isSigner
            ? providerOrSigner
            : undefined;
        if (!provider) {
            throw new Error("Either a provider or custom signer with provider must be provided");
        }
        this.provider = provider;
        this.multicallProvider = new multicall_1.providers.MulticallProvider(this.provider);
        this.contract = new ethers_1.Contract((_f = overrides === null || overrides === void 0 ? void 0 : overrides.contractAddress) !== null && _f !== void 0 ? _f : constants_1.CROSS_CHAIN_SEAPORT_ADDRESS, Seaport_1.SeaportABI, this.multicallProvider);
        this.domainRegistry = new ethers_1.Contract((_g = overrides === null || overrides === void 0 ? void 0 : overrides.domainRegistryAddress) !== null && _g !== void 0 ? _g : constants_1.DOMAIN_REGISTRY_ADDRESS, DomainRegistry_1.DomainRegistryABI, this.multicallProvider);
        this.config = {
            ascendingAmountFulfillmentBuffer: ascendingAmountFulfillmentBuffer,
            balanceAndApprovalChecksOnOrderCreation: balanceAndApprovalChecksOnOrderCreation,
            conduitKeyToConduit: __assign(__assign(__assign({}, constants_1.KNOWN_CONDUIT_KEYS_TO_CONDUIT), (_b = {}, _b[constants_1.NO_CONDUIT] = this.contract.address, _b)), conduitKeyToConduit),
        };
        this.defaultConduitKey = (_h = overrides === null || overrides === void 0 ? void 0 : overrides.defaultConduitKey) !== null && _h !== void 0 ? _h : constants_1.NO_CONDUIT;
    }
    Seaport.prototype._getSigner = function (accountAddress) {
        if (this.signer) {
            return this.signer;
        }
        if (!(this.provider instanceof ethers_1.providers.JsonRpcProvider)) {
            throw new Error("Either signer or a JsonRpcProvider must be provided");
        }
        return this.provider.getSigner(accountAddress);
    };
    /**
     * Returns the corresponding order type based on whether it allows partial fills and is restricted by zone
     *
     * @param input
     * @param input.allowPartialFills Whether or not the order can be partially filled
     * @param input.restrictedByZone Whether or not the order can only be filled/cancelled by the zone
     * @returns the order type
     */
    Seaport.prototype._getOrderTypeFromOrderOptions = function (_a) {
        var allowPartialFills = _a.allowPartialFills, restrictedByZone = _a.restrictedByZone;
        if (allowPartialFills) {
            return restrictedByZone
                ? constants_1.OrderType.PARTIAL_RESTRICTED
                : constants_1.OrderType.PARTIAL_OPEN;
        }
        return restrictedByZone ? constants_1.OrderType.FULL_RESTRICTED : constants_1.OrderType.FULL_OPEN;
    };
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
    Seaport.prototype.createOrder = function (_a, accountAddress) {
        var _b;
        var _c = _a.conduitKey, conduitKey = _c === void 0 ? this.defaultConduitKey : _c, _d = _a.zone, zone = _d === void 0 ? ethers_1.ethers.constants.AddressZero : _d, _e = _a.startTime, startTime = _e === void 0 ? Math.floor(Date.now() / 1000).toString() : _e, _f = _a.endTime, endTime = _f === void 0 ? constants_1.MAX_INT.toString() : _f, offer = _a.offer, consideration = _a.consideration, counter = _a.counter, allowPartialFills = _a.allowPartialFills, restrictedByZone = _a.restrictedByZone, fees = _a.fees, domain = _a.domain, salt = _a.salt;
        return __awaiter(this, void 0, void 0, function () {
            var signer, offerer, offerItems, considerationItems, currencies, totalCurrencyAmount, operator, _g, resolvedCounter, balancesAndApprovals, orderType, considerationItemsWithFees, saltFollowingConditional, orderParameters, checkBalancesAndApprovals, insufficientApprovals, approvalActions, _h, createOrderAction, actions;
            var _this = this;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        signer = this._getSigner(accountAddress);
                        return [4 /*yield*/, signer.getAddress()];
                    case 1:
                        offerer = _j.sent();
                        offerItems = offer.map(order_1.mapInputItemToOfferItem);
                        considerationItems = __spreadArray([], __read(consideration.map(function (consideration) {
                            var _a;
                            return (__assign(__assign({}, (0, order_1.mapInputItemToOfferItem)(consideration)), { recipient: (_a = consideration.recipient) !== null && _a !== void 0 ? _a : offerer }));
                        })), false);
                        if (!(0, order_1.areAllCurrenciesSame)({
                            offer: offerItems,
                            consideration: considerationItems,
                        })) {
                            throw new Error("All currency tokens in the order must be the same token");
                        }
                        currencies = __spreadArray(__spreadArray([], __read(offerItems), false), __read(considerationItems), false).filter(item_1.isCurrencyItem);
                        totalCurrencyAmount = (0, order_1.totalItemsAmount)(currencies);
                        operator = this.config.conduitKeyToConduit[conduitKey];
                        return [4 /*yield*/, Promise.all([
                                counter !== null && counter !== void 0 ? counter : this.getCounter(offerer),
                                (0, balanceAndApprovalCheck_1.getBalancesAndApprovals)({
                                    owner: offerer,
                                    items: offerItems,
                                    criterias: [],
                                    multicallProvider: this.multicallProvider,
                                    operator: operator,
                                }),
                            ])];
                    case 2:
                        _g = __read.apply(void 0, [_j.sent(), 2]), resolvedCounter = _g[0], balancesAndApprovals = _g[1];
                        orderType = this._getOrderTypeFromOrderOptions({
                            allowPartialFills: allowPartialFills,
                            restrictedByZone: restrictedByZone,
                        });
                        considerationItemsWithFees = __spreadArray(__spreadArray([], __read((0, order_1.deductFees)(considerationItems, fees)), false), __read((currencies.length
                            ? (_b = fees === null || fees === void 0 ? void 0 : fees.map(function (fee) {
                                return (0, order_1.feeToConsiderationItem)({
                                    fee: fee,
                                    token: currencies[0].token,
                                    baseAmount: totalCurrencyAmount.startAmount,
                                    baseEndAmount: totalCurrencyAmount.endAmount,
                                });
                            })) !== null && _b !== void 0 ? _b : []
                            : [])), false);
                        saltFollowingConditional = salt ||
                            (domain ? (0, order_1.generateRandomSaltWithDomain)(domain) : (0, order_1.generateRandomSalt)());
                        orderParameters = {
                            offerer: offerer,
                            zone: zone,
                            // TODO: Placeholder
                            zoneHash: (0, utils_1.formatBytes32String)(resolvedCounter.toString()),
                            startTime: startTime,
                            endTime: endTime,
                            orderType: orderType,
                            offer: offerItems,
                            consideration: considerationItemsWithFees,
                            totalOriginalConsiderationItems: considerationItemsWithFees.length,
                            salt: saltFollowingConditional,
                            conduitKey: conduitKey,
                        };
                        checkBalancesAndApprovals = this.config.balanceAndApprovalChecksOnOrderCreation;
                        insufficientApprovals = checkBalancesAndApprovals
                            ? (0, balanceAndApprovalCheck_1.validateOfferBalancesAndApprovals)({
                                offer: offerItems,
                                criterias: [],
                                balancesAndApprovals: balancesAndApprovals,
                                throwOnInsufficientBalances: checkBalancesAndApprovals,
                                operator: operator,
                            })
                            : [];
                        if (!checkBalancesAndApprovals) return [3 /*break*/, 4];
                        return [4 /*yield*/, (0, approval_1.getApprovalActions)(insufficientApprovals, signer)];
                    case 3:
                        _h = _j.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        _h = [];
                        _j.label = 5;
                    case 5:
                        approvalActions = _h;
                        createOrderAction = {
                            type: "create",
                            getMessageToSign: function () {
                                return _this._getMessageToSign(orderParameters, resolvedCounter);
                            },
                            createOrder: function () { return __awaiter(_this, void 0, void 0, function () {
                                var signature;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.signOrder(orderParameters, resolvedCounter, offerer)];
                                        case 1:
                                            signature = _a.sent();
                                            return [2 /*return*/, {
                                                    parameters: __assign(__assign({}, orderParameters), { counter: resolvedCounter }),
                                                    signature: signature,
                                                }];
                                    }
                                });
                            }); },
                        };
                        actions = __spreadArray(__spreadArray([], __read(approvalActions), false), [createOrderAction], false);
                        return [2 /*return*/, {
                                actions: actions,
                                executeAllActions: function () {
                                    return (0, usecase_1.executeAllActions)(actions);
                                },
                            }];
                }
            });
        });
    };
    /**
     * Returns the domain data used when signing typed data
     * @returns domain data
     */
    Seaport.prototype._getDomainData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var chainId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.provider.getNetwork()];
                    case 1:
                        chainId = (_a.sent()).chainId;
                        return [2 /*return*/, {
                                name: constants_1.SEAPORT_CONTRACT_NAME,
                                version: constants_1.SEAPORT_CONTRACT_VERSION,
                                chainId: chainId,
                                verifyingContract: this.contract.address,
                            }];
                }
            });
        });
    };
    /**
     * Returns a raw message to be signed using EIP-712
     * @param orderParameters order parameter struct
     * @param counter counter of the order
     * @returns JSON string of the message to be signed
     */
    Seaport.prototype._getMessageToSign = function (orderParameters, counter) {
        return __awaiter(this, void 0, void 0, function () {
            var domainData, orderComponents;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._getDomainData()];
                    case 1:
                        domainData = _a.sent();
                        orderComponents = __assign(__assign({}, orderParameters), { counter: counter });
                        return [2 /*return*/, JSON.stringify(utils_1._TypedDataEncoder.getPayload(domainData, constants_1.EIP_712_ORDER_TYPE, orderComponents))];
                }
            });
        });
    };
    /**
     * Submits a request to your provider to sign the order. Signed orders are used for off-chain order books.
     * @param orderParameters standard order parameter struct
     * @param counter counter of the offerer
     * @param accountAddress optional account address from which to sign the order with.
     * @returns the order signature
     */
    Seaport.prototype.signOrder = function (orderParameters, counter, accountAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var signer, domainData, orderComponents, signature;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        signer = this._getSigner(accountAddress);
                        return [4 /*yield*/, this._getDomainData()];
                    case 1:
                        domainData = _a.sent();
                        orderComponents = __assign(__assign({}, orderParameters), { counter: counter });
                        return [4 /*yield*/, signer._signTypedData(domainData, constants_1.EIP_712_ORDER_TYPE, orderComponents)];
                    case 2:
                        signature = _a.sent();
                        // Use EIP-2098 compact signatures to save gas. https://eips.ethereum.org/EIPS/eip-2098
                        return [2 /*return*/, ethers_1.ethers.utils.splitSignature(signature).compact];
                }
            });
        });
    };
    /**
     * Cancels a list of orders so that they are no longer fulfillable.
     *
     * @param orders list of order components
     * @param accountAddress optional account address from which to cancel the orders from.
     * @param domain optional domain to be hashed and appended to calldata
     * @returns the set of transaction methods that can be used
     */
    Seaport.prototype.cancelOrders = function (orders, accountAddress, domain) {
        var signer = this._getSigner(accountAddress);
        return (0, usecase_1.getTransactionMethods)(this.contract.connect(signer), "cancel", [orders], domain);
    };
    /**
     * Bulk cancels all existing orders for a given account
     * @param offerer the account to bulk cancel orders on
     * @param domain optional domain to be hashed and appended to calldata
     * @returns the set of transaction methods that can be used
     */
    Seaport.prototype.bulkCancelOrders = function (offerer, domain) {
        var signer = this._getSigner(offerer);
        return (0, usecase_1.getTransactionMethods)(this.contract.connect(signer), "incrementCounter", [], domain);
    };
    /**
     * Approves a list of orders on-chain. This allows accounts to fulfill the order without requiring
     * a signature. Can also check if an order is valid using `callStatic`
     * @param orders list of order structs
     * @param accountAddress optional account address to approve orders.
     * @param domain optional domain to be hashed and appended to calldata
     * @returns the set of transaction methods that can be used
     */
    Seaport.prototype.validate = function (orders, accountAddress, domain) {
        var signer = this._getSigner(accountAddress);
        return (0, usecase_1.getTransactionMethods)(this.contract.connect(signer), "validate", [orders], domain);
    };
    /**
     * Returns the order status given an order hash
     * @param orderHash the hash of the order
     * @returns an order status struct
     */
    Seaport.prototype.getOrderStatus = function (orderHash) {
        return this.contract.getOrderStatus(orderHash);
    };
    /**
     * Gets the counter of a given offerer
     * @param offerer the offerer to get the counter of
     * @returns counter as a number
     */
    Seaport.prototype.getCounter = function (offerer) {
        return this.contract
            .getCounter(offerer)
            .then(function (counter) { return counter.toNumber(); });
    };
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
    Seaport.prototype.fulfillOrder = function (_a) {
        var order = _a.order, unitsToFill = _a.unitsToFill, _b = _a.offerCriteria, offerCriteria = _b === void 0 ? [] : _b, _c = _a.considerationCriteria, considerationCriteria = _c === void 0 ? [] : _c, _d = _a.tips, tips = _d === void 0 ? [] : _d, _e = _a.extraData, extraData = _e === void 0 ? "0x" : _e, accountAddress = _a.accountAddress, _f = _a.conduitKey, conduitKey = _f === void 0 ? this.defaultConduitKey : _f, _g = _a.recipientAddress, recipientAddress = _g === void 0 ? ethers_1.ethers.constants.AddressZero : _g, _h = _a.domain, domain = _h === void 0 ? "" : _h;
        return __awaiter(this, void 0, void 0, function () {
            var orderParameters, offerer, offer, consideration, fulfiller, fulfillerAddress, offererOperator, fulfillerOperator, _j, offererBalancesAndApprovals, fulfillerBalancesAndApprovals, currentBlock, orderStatus, currentBlockTimestamp, totalFilled, totalSize, sanitizedOrder, timeBasedItemParams, tipConsiderationItems, isRecipientSelf;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        orderParameters = order.parameters;
                        offerer = orderParameters.offerer, offer = orderParameters.offer, consideration = orderParameters.consideration;
                        fulfiller = this._getSigner(accountAddress);
                        return [4 /*yield*/, fulfiller.getAddress()];
                    case 1:
                        fulfillerAddress = _k.sent();
                        offererOperator = this.config.conduitKeyToConduit[orderParameters.conduitKey];
                        fulfillerOperator = this.config.conduitKeyToConduit[conduitKey];
                        return [4 /*yield*/, Promise.all([
                                (0, balanceAndApprovalCheck_1.getBalancesAndApprovals)({
                                    owner: offerer,
                                    items: offer,
                                    criterias: offerCriteria,
                                    multicallProvider: this.multicallProvider,
                                    operator: offererOperator,
                                }),
                                // Get fulfiller balances and approvals of all items in the set, as offer items
                                // may be received by the fulfiller for standard fulfills
                                (0, balanceAndApprovalCheck_1.getBalancesAndApprovals)({
                                    owner: fulfillerAddress,
                                    items: __spreadArray(__spreadArray([], __read(offer), false), __read(consideration), false),
                                    criterias: __spreadArray(__spreadArray([], __read(offerCriteria), false), __read(considerationCriteria), false),
                                    multicallProvider: this.multicallProvider,
                                    operator: fulfillerOperator,
                                }),
                                this.multicallProvider.getBlock("latest"),
                                this.getOrderStatus(this.getOrderHash(orderParameters)),
                            ])];
                    case 2:
                        _j = __read.apply(void 0, [_k.sent(), 4]), offererBalancesAndApprovals = _j[0], fulfillerBalancesAndApprovals = _j[1], currentBlock = _j[2], orderStatus = _j[3];
                        currentBlockTimestamp = currentBlock.timestamp;
                        totalFilled = orderStatus.totalFilled, totalSize = orderStatus.totalSize;
                        sanitizedOrder = (0, fulfill_1.validateAndSanitizeFromOrderStatus)(order, orderStatus);
                        timeBasedItemParams = {
                            startTime: sanitizedOrder.parameters.startTime,
                            endTime: sanitizedOrder.parameters.endTime,
                            currentBlockTimestamp: currentBlockTimestamp,
                            ascendingAmountTimestampBuffer: this.config.ascendingAmountFulfillmentBuffer,
                        };
                        tipConsiderationItems = tips.map(function (tip) { return (__assign(__assign({}, (0, order_1.mapInputItemToOfferItem)(tip)), { recipient: tip.recipient })); });
                        isRecipientSelf = recipientAddress === ethers_1.ethers.constants.AddressZero;
                        // We use basic fulfills as they are more optimal for simple and "hot" use cases
                        // We cannot use basic fulfill if user is trying to partially fill though.
                        if (!unitsToFill &&
                            isRecipientSelf &&
                            (0, fulfill_1.shouldUseBasicFulfill)(sanitizedOrder.parameters, totalFilled)) {
                            // TODO: Use fulfiller proxy if there are approvals needed directly, but none needed for proxy
                            return [2 /*return*/, (0, fulfill_1.fulfillBasicOrder)({
                                    order: sanitizedOrder,
                                    seaportContract: this.contract,
                                    offererBalancesAndApprovals: offererBalancesAndApprovals,
                                    fulfillerBalancesAndApprovals: fulfillerBalancesAndApprovals,
                                    timeBasedItemParams: timeBasedItemParams,
                                    conduitKey: conduitKey,
                                    offererOperator: offererOperator,
                                    fulfillerOperator: fulfillerOperator,
                                    signer: fulfiller,
                                    tips: tipConsiderationItems,
                                    domain: domain,
                                })];
                        }
                        // Else, we fallback to the standard fulfill order
                        return [2 /*return*/, (0, fulfill_1.fulfillStandardOrder)({
                                order: sanitizedOrder,
                                unitsToFill: unitsToFill,
                                totalFilled: totalFilled,
                                totalSize: totalSize.eq(0)
                                    ? (0, item_1.getMaximumSizeForOrder)(sanitizedOrder)
                                    : totalSize,
                                offerCriteria: offerCriteria,
                                considerationCriteria: considerationCriteria,
                                tips: tipConsiderationItems,
                                extraData: extraData,
                                seaportContract: this.contract,
                                offererBalancesAndApprovals: offererBalancesAndApprovals,
                                fulfillerBalancesAndApprovals: fulfillerBalancesAndApprovals,
                                timeBasedItemParams: timeBasedItemParams,
                                conduitKey: conduitKey,
                                signer: fulfiller,
                                offererOperator: offererOperator,
                                fulfillerOperator: fulfillerOperator,
                                recipientAddress: recipientAddress,
                                domain: domain,
                            })];
                }
            });
        });
    };
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
    Seaport.prototype.fulfillOrders = function (_a) {
        var fulfillOrderDetails = _a.fulfillOrderDetails, accountAddress = _a.accountAddress, _b = _a.conduitKey, conduitKey = _b === void 0 ? this.defaultConduitKey : _b, _c = _a.recipientAddress, recipientAddress = _c === void 0 ? ethers_1.ethers.constants.AddressZero : _c, _d = _a.domain, domain = _d === void 0 ? "" : _d;
        return __awaiter(this, void 0, void 0, function () {
            var fulfiller, fulfillerAddress, allOffererOperators, fulfillerOperator, allOfferItems, allConsiderationItems, allOfferCriteria, allConsiderationCriteria, _e, offerersBalancesAndApprovals, fulfillerBalancesAndApprovals, currentBlock, orderStatuses, ordersMetadata;
            var _this = this;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        fulfiller = this._getSigner(accountAddress);
                        return [4 /*yield*/, fulfiller.getAddress()];
                    case 1:
                        fulfillerAddress = _f.sent();
                        allOffererOperators = fulfillOrderDetails.map(function (_a) {
                            var order = _a.order;
                            return _this.config.conduitKeyToConduit[order.parameters.conduitKey];
                        });
                        fulfillerOperator = this.config.conduitKeyToConduit[conduitKey];
                        allOfferItems = fulfillOrderDetails.flatMap(function (_a) {
                            var order = _a.order;
                            return order.parameters.offer;
                        });
                        allConsiderationItems = fulfillOrderDetails.flatMap(function (_a) {
                            var order = _a.order;
                            return order.parameters.consideration;
                        });
                        allOfferCriteria = fulfillOrderDetails.flatMap(function (_a) {
                            var _b = _a.offerCriteria, offerCriteria = _b === void 0 ? [] : _b;
                            return offerCriteria;
                        });
                        allConsiderationCriteria = fulfillOrderDetails.flatMap(function (_a) {
                            var _b = _a.considerationCriteria, considerationCriteria = _b === void 0 ? [] : _b;
                            return considerationCriteria;
                        });
                        return [4 /*yield*/, Promise.all([
                                Promise.all(fulfillOrderDetails.map(function (_a, i) {
                                    var order = _a.order, _b = _a.offerCriteria, offerCriteria = _b === void 0 ? [] : _b;
                                    return (0, balanceAndApprovalCheck_1.getBalancesAndApprovals)({
                                        owner: order.parameters.offerer,
                                        items: order.parameters.offer,
                                        criterias: offerCriteria,
                                        operator: allOffererOperators[i],
                                        multicallProvider: _this.multicallProvider,
                                    });
                                })),
                                // Get fulfiller balances and approvals of all items in the set, as offer items
                                // may be received by the fulfiller for standard fulfills
                                (0, balanceAndApprovalCheck_1.getBalancesAndApprovals)({
                                    owner: fulfillerAddress,
                                    items: __spreadArray(__spreadArray([], __read(allOfferItems), false), __read(allConsiderationItems), false),
                                    criterias: __spreadArray(__spreadArray([], __read(allOfferCriteria), false), __read(allConsiderationCriteria), false),
                                    operator: fulfillerOperator,
                                    multicallProvider: this.multicallProvider,
                                }),
                                this.multicallProvider.getBlock("latest"),
                                Promise.all(fulfillOrderDetails.map(function (_a) {
                                    var order = _a.order;
                                    return _this.getOrderStatus(_this.getOrderHash(order.parameters));
                                })),
                            ])];
                    case 2:
                        _e = __read.apply(void 0, [_f.sent(), 4]), offerersBalancesAndApprovals = _e[0], fulfillerBalancesAndApprovals = _e[1], currentBlock = _e[2], orderStatuses = _e[3];
                        ordersMetadata = fulfillOrderDetails.map(function (orderDetails, index) {
                            var _a, _b, _c, _d, _e;
                            return ({
                                order: orderDetails.order,
                                unitsToFill: orderDetails.unitsToFill,
                                orderStatus: orderStatuses[index],
                                offerCriteria: (_a = orderDetails.offerCriteria) !== null && _a !== void 0 ? _a : [],
                                considerationCriteria: (_b = orderDetails.considerationCriteria) !== null && _b !== void 0 ? _b : [],
                                tips: (_d = (_c = orderDetails.tips) === null || _c === void 0 ? void 0 : _c.map(function (tip) { return (__assign(__assign({}, (0, order_1.mapInputItemToOfferItem)(tip)), { recipient: tip.recipient })); })) !== null && _d !== void 0 ? _d : [],
                                extraData: (_e = orderDetails.extraData) !== null && _e !== void 0 ? _e : "0x",
                                offererBalancesAndApprovals: offerersBalancesAndApprovals[index],
                                offererOperator: allOffererOperators[index],
                            });
                        });
                        return [2 /*return*/, (0, fulfill_1.fulfillAvailableOrders)({
                                ordersMetadata: ordersMetadata,
                                seaportContract: this.contract,
                                fulfillerBalancesAndApprovals: fulfillerBalancesAndApprovals,
                                currentBlockTimestamp: currentBlock.timestamp,
                                ascendingAmountTimestampBuffer: this.config.ascendingAmountFulfillmentBuffer,
                                fulfillerOperator: fulfillerOperator,
                                signer: fulfiller,
                                conduitKey: conduitKey,
                                recipientAddress: recipientAddress,
                                domain: domain,
                            })];
                }
            });
        });
    };
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
    Seaport.prototype.matchOrders = function (_a) {
        var orders = _a.orders, fulfillments = _a.fulfillments, overrides = _a.overrides, accountAddress = _a.accountAddress, _b = _a.domain, domain = _b === void 0 ? "" : _b;
        var signer = this._getSigner(accountAddress);
        return (0, usecase_1.getTransactionMethods)(this.contract.connect(signer), "matchOrders", [orders, fulfillments, overrides], domain);
    };
    Seaport.prototype.setDomain = function (domain, accountAddress) {
        var signer = this._getSigner(accountAddress);
        return (0, usecase_1.getTransactionMethods)(this.domainRegistry.connect(signer), "setDomain", [domain]);
    };
    Seaport.prototype.getNumberOfDomains = function (tag) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.domainRegistry.getNumberOfDomains(tag)];
            });
        });
    };
    Seaport.prototype.getDomain = function (tag, index) {
        return this.domainRegistry.getDomain(tag, index);
    };
    Seaport.prototype.getDomains = function (tag, shouldThrow) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1, totalDomains, domainArray;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 1, , 3]);
                        if (shouldThrow) {
                            throw Error;
                        }
                        return [2 /*return*/, this.domainRegistry.getDomains(tag)];
                    case 1:
                        error_1 = _a.sent();
                        return [4 /*yield*/, this.domainRegistry.getNumberOfDomains(tag)];
                    case 2:
                        totalDomains = (_a.sent()).toNumber();
                        domainArray = Promise.all(__spreadArray([], __read(Array(totalDomains).keys()), false).map(function (i) {
                            return _this.domainRegistry.getDomain(tag, i);
                        }));
                        return [2 /*return*/, domainArray];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return Seaport;
}());
exports.Seaport = Seaport;
//# sourceMappingURL=seaport.js.map