import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { TokenService } from 'src/token/service/token.service';
import { MemberRepository } from '../repository/member.repository';
import { getTokenValue, validateManipulatedToken } from 'src/util/token.util';
import { MemberNicknameResponse } from '../dto/memberNicknameResponse';
import { companies } from 'src/constant/constant';
import { OAuthRequest } from 'src/auth/interface/auth.interface';
import { Member } from '../entity/member';
import { OnEvent } from '@nestjs/event-emitter';
import { ManipulatedTokenNotFiltered } from 'src/token/exception/token.exception';

@Injectable()
export class MemberService {
  constructor(
    private tokenService: TokenService,
    private memberRepository: MemberRepository,
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

  @OnEvent('member.create')
  async createMember(oauthRequest: OAuthRequest) {
    let member = new Member(
      null,
      oauthRequest.email,
      oauthRequest.name,
      oauthRequest.img,
      new Date(),
    );
    await this.memberRepository.save(member);
  }

  @OnEvent('member.manipulated')
  async validateManipulatedToken(member: Member) {
    if (!member) throw new ManipulatedTokenNotFiltered();
  }
}
