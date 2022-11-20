/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    InAuthEvent,
    InAuthMpEvent,
    InBatchJobResult,
    InBatchJobResultEvent,
    InComponentVerifyTicket,
    InEnterAgentEvent,
    InExternalContact,
    InExternalContactEvent,
    InFollowEvent,
    InImageMsg,
    InLinkMsg,
    InLocationEvent,
    InLocationMsg,
    InMassEvent,
    InMenuEvent,
    InMsg,
    InNotDefinedMsg,
    InQrCodeEvent,
    InRegisterCorp,
    InShakearoundUserShakeEvent,
    InShortVideoMsg,
    InSpeechRecognitionResults,
    InSuiteTicket,
    InTaskEvent,
    InTemplateMsgEvent,
    InTextMsg,
    InUpdatePartyEvent,
    InUpdateTagEvent,
    InUpdateUserEvent,
    InVideoMsg,
    InVoiceMsg,
    InWxVerifyDispatchEvent,
    MsgAdapter,
    OutMsg,
    OutTextMsg,
} from '@tnwx/commons'

export abstract class AbstractAdapter implements MsgAdapter {
    async processInTextMsg(inTextMsg: InTextMsg): Promise<OutMsg> {
        return await this.renderOutTextMsg(inTextMsg)
    }

    async processInImageMsg(inImageMsg: InImageMsg): Promise<OutMsg> {
        return await this.renderOutTextMsg(inImageMsg)
    }

    async processInVoiceMsg(inVoiceMsg: InVoiceMsg): Promise<OutMsg> {
        return await this.renderOutTextMsg(inVoiceMsg)
    }

    async processInVideoMsg(inVideoMsg: InVideoMsg): Promise<OutMsg> {
        return await this.renderOutTextMsg(inVideoMsg)
    }

    async processInShortVideoMsg(
        inShortVideoMsg: InShortVideoMsg,
    ): Promise<OutMsg> {
        return await this.renderOutTextMsg(inShortVideoMsg)
    }

    async processInLocationMsg(inLocationMsg: InLocationMsg): Promise<OutMsg> {
        return await this.renderOutTextMsg(inLocationMsg)
    }

    async processInLinkMsg(inLinkMsg: InLinkMsg): Promise<OutMsg> {
        return await this.renderOutTextMsg(inLinkMsg)
    }

    async processInSpeechRecognitionResults(
        inSpeechRecognitionResults: InSpeechRecognitionResults,
    ): Promise<OutMsg> {
        return await this.renderOutTextMsg(inSpeechRecognitionResults)
    }

    async processIsNotDefinedMsg(
        inNotDefinedMsg: InNotDefinedMsg,
    ): Promise<OutMsg> {
        return await this.renderOutTextMsg(inNotDefinedMsg)
    }

    async processInFollowEvent(inFollowEvent: InFollowEvent): Promise<OutMsg> {
        return await this.renderOutTextMsg(inFollowEvent)
    }

    async processInQrCodeEvent(inQrCodeEvent: InQrCodeEvent): Promise<OutMsg> {
        return await this.renderOutTextMsg(inQrCodeEvent)
    }

    async processInLocationEvent(
        inLocationEvent: InLocationEvent,
    ): Promise<OutMsg> {
        return await this.renderOutTextMsg(inLocationEvent)
    }

    async processInMenuEvent(inMenuEvent: InMenuEvent): Promise<OutMsg> {
        return await this.renderOutTextMsg(inMenuEvent)
    }

    async processInWxVerifyDispatchEvent(
        inWxVerifyDispatchEvent: InWxVerifyDispatchEvent,
    ): Promise<OutMsg> {
        return await this.renderOutTextMsg(inWxVerifyDispatchEvent)
    }

    async processInTemplateMsgEvent(
        inTemplateMsgEvent: InTemplateMsgEvent,
    ): Promise<OutMsg> {
        return await this.renderOutTextMsg(inTemplateMsgEvent)
    }

    async processInShakearoundUserShakeEvent(
        inShakearoundUserShakeEvent: InShakearoundUserShakeEvent,
    ): Promise<OutMsg> {
        return await this.renderOutTextMsg(inShakearoundUserShakeEvent)
    }

    async processInTaskEvent(inTaskEvent: InTaskEvent): Promise<OutMsg> {
        return await this.renderOutTextMsg(inTaskEvent)
    }

    async processInEnterAgentEvent(
        inEnterAgentEvent: InEnterAgentEvent,
    ): Promise<OutMsg> {
        return await this.renderOutTextMsg(inEnterAgentEvent)
    }

    async processInBatchJobResultEvent(
        inBatchJobResultEvent: InBatchJobResultEvent,
    ): Promise<OutMsg> {
        return await this.renderOutTextMsg(inBatchJobResultEvent)
    }

    async processInUpdateUserEvent(
        inUpdateUserEvent: InUpdateUserEvent,
    ): Promise<OutMsg> {
        return await this.renderOutTextMsg(inUpdateUserEvent)
    }

    async processInUpdatePartyEvent(
        inUpdatePartyEvent: InUpdatePartyEvent,
    ): Promise<OutMsg> {
        return await this.renderOutTextMsg(inUpdatePartyEvent)
    }

    async processInUpdateTagEvent(
        inUpdateTagEvent: InUpdateTagEvent,
    ): Promise<OutMsg> {
        return await this.renderOutTextMsg(inUpdateTagEvent)
    }

    async processInMassEvent(inMassEvent: InMassEvent): Promise<OutMsg> {
        return await this.renderOutTextMsg(inMassEvent)
    }

    async processInSuiteTicket(inSuiteTicket: InSuiteTicket): Promise<string> {
        return Promise.resolve('success')
    }

    async processInComponentVerifyTicket(
        inComponentVerifyTicket: InComponentVerifyTicket,
    ): Promise<string> {
        return Promise.resolve('success')
    }

    async processInAuthEvent(inAuthEvent: InAuthEvent): Promise<string> {
        return Promise.resolve('success')
    }

    async processInAuthMpEvent(inAuthMpEvent: InAuthMpEvent): Promise<string> {
        return Promise.resolve('success')
    }

    async processInBatchJobResult(
        inBatchJobResult: InBatchJobResult,
    ): Promise<string> {
        return Promise.resolve('success')
    }

    async processInExternalContactEvent(
        inExternalContactEvent: InExternalContactEvent,
    ): Promise<string> {
        return Promise.resolve('success')
    }

    async processInExternalContact(
        inExternalContact: InExternalContact,
    ): Promise<string> {
        return Promise.resolve('success')
    }

    async processInRegisterCorp(
        inRegisterCorp: InRegisterCorp,
    ): Promise<string> {
        return Promise.resolve('success')
    }

    async renderOutTextMsg(
        inMsg: InMsg,
        content?: string,
    ): Promise<OutTextMsg> {
        const outMsg = new OutTextMsg(inMsg)
        outMsg.setContent(content ? content : '  ')
        return outMsg
    }
}
