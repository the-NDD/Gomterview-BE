import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { TokenService } from 'src/token/service/token.service';
import { MemberRepository } from '../repository/member.repository';
import { getTokenValue } from 'src/util/token.util';
import { MemberNicknameResponse } from '../dto/memberNicknameResponse';
import { companies } from 'src/constant/constant';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ValidateMemberExistenceEvent } from '../event/validate.member.existence.event';
import { MemberNotFoundException } from '../exception/member.exception';
import { Member } from '../entity/member';
import { DeleteMemberInfoEvent } from '../event/delete.member.info.event';

@Injectable()
export class MemberService {
  constructor(
    private tokenService: TokenService,
    private memberRepository: MemberRepository,
    private emitter: EventEmitter2,
  ) {}
  async getNameForInterview(req: Request) {
    if (!req.cookies['accessToken'])
      return new MemberNicknameResponse(this.getNameWithPrefix(`면접자`));

    const member = await this.getMemberByToken(getTokenValue(req));
    return new MemberNicknameResponse(this.getNameWithPrefix(member.nickname));
  }

  private async getMemberByToken(tokenValue: string) {
    const member = await this.tokenService.getPayload(tokenValue);
    return await this.memberRepository.findById(member.id);
  }

  private getNameWithPrefix(nickname: string) {
    const randomCompany =
      companies[Math.floor(Math.random() * companies.length)];
    return `${randomCompany} 최종 면접에 들어온 ${nickname}`;
  }

  async deleteMember(member: Member) {
    await this.memberRepository.remove(member);
    const event = DeleteMemberInfoEvent.of(member.id);
    await this.emitter.emitAsync(DeleteMemberInfoEvent.MESSAGE, event);
  }

  @OnEvent(ValidateMemberExistenceEvent.MESSAGE, { suppressErrors: false })
  async validateMemberExistence(event: ValidateMemberExistenceEvent) {
    const member = await this.memberRepository.findById(event.memberId);
    if (!member) throw new MemberNotFoundException();
  }
}
