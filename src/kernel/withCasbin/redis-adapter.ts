import { FilteredAdapter, Helper, Model } from 'casbin'
import Redis from 'ioredis'

export interface IConnectionOptions {
    host: string
    port: number
}

export interface Filters {
    [ptype: string]: string[]
}

class Line {
    ptype = ''
    v0 = ''
    v1 = ''
    v2 = ''
    v3 = ''
    v4 = ''
    v5 = ''
}

export class NodeRedisAdapter implements FilteredAdapter {
    private readonly redisInstance: Redis
    private policies: Line[] = []
    private filtered = false

    constructor(redis: Redis) {
        this.redisInstance = redis
    }

    public static async newAdapter(redis: Redis) {
        return new NodeRedisAdapter(await redis.duplicate())
    }

    public isFiltered(): boolean {
        return this.filtered
    }

    savePolicyLine(ptype: any, rule: any) {
        const line = new Line()
        line.ptype = ptype
        switch (rule.length) {
            case 6:
                line.v5 = rule[5]
                break
            case 5:
                line.v4 = rule[4]
                break
            case 4:
                line.v3 = rule[3]
                break
            case 3:
                line.v2 = rule[2]
                break
            case 2:
                line.v1 = rule[1]
                break
            case 1:
                line.v0 = rule[0]
                break
            default:
                throw new Error(
                    'Rule should not be empty or have more than 6 arguments.',
                )
        }
        return line
    }

    loadPolicyLine(line: any, model: any) {
        //console.log("Load policies line called")
        const lineText =
            line.ptype +
            ', ' +
            [line.v0, line.v1, line.v2, line.v3, line.v4, line.v5]
                .filter((n) => n)
                .join(', ')
        // console.log(lineText)
        Helper.loadPolicyLine(lineText, model)
    }

    async storePolicies(policies: Line[]): Promise<void> {
        await this.redisInstance.del('policies')
        await this.redisInstance.set('policies', JSON.stringify(policies))
    }

    async loadFilteredPolicy(
        model: Model,
        policyFilter: Filters,
    ): Promise<void> {
        const policies = await this.redisInstance.get('policies')
        if (policies) {
            const parsedPolicies = JSON.parse(policies)
            const filteredPolicies = parsedPolicies.filter((policy: Line) => {
                if (!(policy.ptype in policyFilter)) {
                    return false
                }
                const tempPolicy = [
                    policy.v0,
                    policy.v1,
                    policy.v2,
                    policy.v3,
                    policy.v4,
                    policy.v5,
                ]
                const tempFilter = policyFilter[policy.ptype]
                if (tempFilter.length > tempPolicy.length) {
                    return false
                }
                for (let i = 0; i < tempFilter.length; i++) {
                    if (!tempFilter[i]) {
                        continue
                    }
                    if (tempPolicy[i] !== tempFilter[i]) {
                        return false
                    }
                }
                return true
            })
            filteredPolicies.forEach((policy: any) => {
                this.loadPolicyLine(policy, model)
            })
        }
        return void 0
    }

    async loadPolicy(model: Model): Promise<void> {
        const policies = await this.redisInstance.get('policies')
        if (policies) {
            const parsedPolicies = JSON.parse(policies) ?? []
            this.policies = parsedPolicies // for adding and removing policies methods
            parsedPolicies.forEach((policy: any) => {
                this.loadPolicyLine(policy, model)
            })
        }
        return void 0
    }

    async savePolicy(model: Model): Promise<boolean> {
        const policyRuleAST = model.model.get('p')
        const groupingPolicyAST = model.model.get('g')
        const policies: Line[] = []

        for (const astMap of [policyRuleAST, groupingPolicyAST]) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            for (const [ptype, ast] of astMap!) {
                for (const rule of ast.policy) {
                    const line = this.savePolicyLine(ptype, rule)
                    policies.push(line)
                }
            }
        }

        await this.redisInstance.del('policies')
        await this.redisInstance.set('policies', JSON.stringify(policies))
        return true
    }

    async addPolicy(sec: string, ptype: string, rule: any) {
        const line = this.savePolicyLine(ptype, rule)
        this.policies.push(line)
        await this.storePolicies(this.policies)
        // resave the policies
    }

    async removePolicy(
        sec: string,
        ptype: string,
        rule: string[],
    ): Promise<void> {
        const filteredPolicies = this.policies.filter((policy) => {
            let flag = true
            flag &&= ptype == policy.ptype
            if (rule.length > 0) {
                flag &&= rule[0] == policy.v0
            }
            if (rule.length > 1) {
                flag &&= rule[1] == policy.v1
            }
            if (rule.length > 2) {
                flag &&= rule[2] == policy.v2
            }
            if (rule.length > 3) {
                flag &&= rule[3] == policy.v3
            }
            if (rule.length > 4) {
                flag &&= rule[4] == policy.v4
            }
            if (rule.length > 5) {
                flag &&= rule[5] == policy.v5
            }
            return !flag
        })
        this.policies = filteredPolicies
        return await this.storePolicies(filteredPolicies)
    }

    async removeFilteredPolicy(
        sec: string,
        ptype: string,
        fieldIndex: number,
        ...fieldValues: string[]
    ): Promise<void> {
        const rule = new Array<string>(fieldIndex).fill('')
        rule.push(...fieldValues)
        const filteredPolicies = this.policies.filter((policy) => {
            let flag = true
            flag &&= ptype == policy.ptype
            if (rule.length > 0 && rule[0]) {
                flag &&= rule[0] == policy.v0
            }
            if (rule.length > 1 && rule[1]) {
                flag &&= rule[1] == policy.v1
            }
            if (rule.length > 2 && rule[2]) {
                flag &&= rule[2] == policy.v2
            }
            if (rule.length > 3 && rule[3]) {
                flag &&= rule[3] == policy.v3
            }
            if (rule.length > 4 && rule[4]) {
                flag &&= rule[4] == policy.v4
            }
            if (rule.length > 5 && rule[5]) {
                flag &&= rule[5] == policy.v5
            }
            return !flag
        })
        this.policies = filteredPolicies
        return await this.storePolicies(filteredPolicies)
    }

    async close(): Promise<void> {
        return new Promise((resolve) => {
            this.redisInstance.quit(() => {
                resolve()
            })
        })
    }
}
