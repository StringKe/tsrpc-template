import db from '../kernel/db'
import { first, get } from 'lodash'
import { getDataId } from '../utils/nanoid'
import { User } from '../shared/db'

export default class UserService {
    static getOrCreateUserByTrdInfo(
        platform: string,
        platformId: string,
        userInfo: Record<string, any> & { openId: string; unionId?: string },
        bindUserIdOrUser?: User | string,
    ) {
        const { openId, unionId, ...rest } = userInfo
        return db.$transaction(async (t) => {
            const bindUser =
                typeof bindUserIdOrUser === 'string'
                    ? await t.user.findFirst({
                          where: { id: Number(bindUserIdOrUser) },
                      })
                    : bindUserIdOrUser

            const findAuths = await t.userAuth.findMany({
                where: {
                    platform,
                    platformValue: {
                        in: [openId, unionId].filter(Boolean),
                    },
                },
                include: {
                    user: true,
                },
            })

            // 从数据已存在的第三方用户里找用户，如果没找到就用绑定用户
            let user = first(findAuths.map((auth) => auth.user)) || bindUser

            // 如果上面条件不满足，则数据库内不存在用户，需要创建一个新用户
            if (!user) {
                // 用户还是不存在，创建用户
                user = await this.createUser(userInfo)
            }
        })
    }

    static async createUser(userInfo: Record<string, any>) {
        let nickname: string = get(
            userInfo,
            ['nickname', 'NickName', 'name', 'username', 'account'],
            getDataId(8),
        )
        const avatar: string = get(
            userInfo,
            ['avatar', 'Avatar', 'headimgurl', 'headImgUrl', 'avatarUrl'],
            '/assets/images/default-avatar.png',
        )

        if (nickname.length > 20) {
            nickname = nickname.slice(0, 20)
        }
        if (avatar.startsWith('http')) {
            //
        }

        return undefined
    }
}
