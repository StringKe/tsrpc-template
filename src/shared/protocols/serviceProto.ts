import { ServiceProto } from 'tsrpc-proto';
import { ReqSession, ResSession } from './test/PtlSession';
import { ReqThrottler, ResThrottler } from './test/PtlThrottler';

export interface ServiceType {
    api: {
        "test/Session": {
            req: ReqSession,
            res: ResSession
        },
        "test/Throttler": {
            req: ReqThrottler,
            res: ResThrottler
        }
    },
    msg: {

    }
}

export const serviceProto: ServiceProto<ServiceType> = {
    "version": 9,
    "services": [
        {
            "id": 1,
            "name": "test/Session",
            "type": "api",
            "conf": {}
        },
        {
            "id": 2,
            "name": "test/Throttler",
            "type": "api",
            "conf": {
                "throttler": {
                    "ttl": 120,
                    "limit": 10
                }
            }
        }
    ],
    "types": {
        "test/PtlSession/ReqSession": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseRequest"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "type",
                    "type": {
                        "type": "Union",
                        "members": [
                            {
                                "id": 0,
                                "type": {
                                    "type": "Literal",
                                    "literal": "public"
                                }
                            },
                            {
                                "id": 1,
                                "type": {
                                    "type": "Literal",
                                    "literal": "private"
                                }
                            },
                            {
                                "id": 2,
                                "type": {
                                    "type": "Literal",
                                    "literal": "user"
                                }
                            },
                            {
                                "id": 3,
                                "type": {
                                    "type": "Literal",
                                    "literal": null
                                }
                            }
                        ]
                    }
                },
                {
                    "id": 1,
                    "name": "userId",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                }
            ]
        },
        "base/BaseRequest": {
            "type": "Interface",
            "properties": [
                {
                    "id": 1,
                    "name": "_publicData",
                    "type": {
                        "type": "Reference",
                        "target": "base/PublicData"
                    },
                    "optional": true
                }
            ]
        },
        "base/PublicData": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/SessionData"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "_hash",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                }
            ]
        },
        "base/SessionData": {
            "type": "Interface",
            "indexSignature": {
                "keyType": "String",
                "type": {
                    "type": "Union",
                    "members": [
                        {
                            "id": 0,
                            "type": {
                                "type": "Tuple",
                                "elementTypes": [
                                    {
                                        "type": "Union",
                                        "members": [
                                            {
                                                "id": 0,
                                                "type": {
                                                    "type": "Number"
                                                }
                                            },
                                            {
                                                "id": 1,
                                                "type": {
                                                    "type": "Literal",
                                                    "literal": null
                                                }
                                            },
                                            {
                                                "id": 2,
                                                "type": {
                                                    "type": "Literal"
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        "type": "Any"
                                    }
                                ]
                            }
                        },
                        {
                            "id": 1,
                            "type": {
                                "type": "Any"
                            }
                        }
                    ]
                }
            }
        },
        "test/PtlSession/ResSession": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseResponse"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "count",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 1,
                    "name": "before",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 2,
                    "name": "userId",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                }
            ]
        },
        "base/BaseResponse": {
            "type": "Interface",
            "properties": [
                {
                    "id": 3,
                    "name": "_publicData",
                    "type": {
                        "type": "Reference",
                        "target": "base/PublicData"
                    },
                    "optional": true
                },
                {
                    "id": 1,
                    "name": "_timestamp",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 2,
                    "name": "_throttler",
                    "type": {
                        "type": "Interface",
                        "properties": [
                            {
                                "id": 0,
                                "name": "limit",
                                "type": {
                                    "type": "Number"
                                },
                                "optional": true
                            },
                            {
                                "id": 1,
                                "name": "remaining",
                                "type": {
                                    "type": "Number"
                                },
                                "optional": true
                            },
                            {
                                "id": 2,
                                "name": "reset",
                                "type": {
                                    "type": "Number"
                                },
                                "optional": true
                            }
                        ]
                    },
                    "optional": true
                }
            ]
        },
        "test/PtlThrottler/ReqThrottler": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseRequest"
                    }
                }
            ]
        },
        "test/PtlThrottler/ResThrottler": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseResponse"
                    }
                }
            ]
        }
    }
};