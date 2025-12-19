import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../../common/enums/user-role.enum';
import { CreateInviteDto } from './dtos/create-invite.dto';
import { InviteDto } from './dtos/invite.dto';
import { DatabaseService } from '../../database/database.service';
import { EmailService } from '../email/email.service';
import * as crypto from 'crypto';

@Injectable()
export class InvitesService {
  private readonly inviteSecret: string;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {
    // Use JWT_SECRET as fallback for INVITE_SECRET
    this.inviteSecret = this.configService.get('INVITE_SECRET') 
      || this.configService.get('JWT_SECRET') 
      || 'dojoro-default-invite-secret-change-in-production';
  }

  /**
   * Generate secure signature for invite link
   */
  private generateSignature(token: string, otp: string, email: string): string {
    return crypto
      .createHmac('sha256', this.inviteSecret)
      .update(`${token}:${otp}:${email.toLowerCase()}`)
      .digest('hex')
      .slice(0, 16); // First 16 chars for URL friendliness
  }

  /**
   * Verify signature matches token + otp + email
   */
  verifySignature(token: string, otp: string, email: string, signature: string): boolean {
    const expected = this.generateSignature(token, otp, email);
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature),
    );
  }

  async criar(
    dto: CreateInviteDto,
    user: { id: string; academiaId: string },
  ): Promise<InviteDto & { inviteUrl?: string }> {
    // 1. Generate secure token (32 bytes = 64 hex chars)
    const token = crypto.randomBytes(32).toString('hex');
    
    // 2. Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    
    // 3. Generate signature (token + otp + email)
    const signature = this.generateSignature(token, otp, dto.email || '');
    
    // 4. Hash token for storage (security: don't store plaintext)
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    // 5. Set expiration (24h for security, instead of 7 days)
    const expiresAt = dto.expiraEm 
      ? new Date(dto.expiraEm) 
      : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // 6. Get academy name for email
    const academia = await this.databaseService.queryOne<{ nome: string }>(
      'SELECT nome FROM academias WHERE id = $1',
      [user.academiaId],
    );

    if (!academia) {
      throw new BadRequestException('Academia não encontrada');
    }

    // 7. Save to database
    await this.databaseService.query(
      `
        INSERT INTO convites (
          academia_id, email, token_hash, otp_code, signature,
          papel_sugerido, expires_at, created_by, criado_em
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
      `,
      [
        user.academiaId,
        dto.email,
        tokenHash,
        otp,
        signature,
        dto.roleSugerido || UserRole.ALUNO,
        expiresAt,
        user.id,
      ],
    );

    // 8. Build secure invite URL
    const inviteUrl = `dojoro://register?t=${token}&o=${otp}&s=${signature}`;
    const webUrl = `https://dojoro.com.br/register?t=${token}&o=${otp}&s=${signature}`;

    // 9. Send email if address provided
    if (dto.email) {
      this.emailService
        .sendInviteEmail(dto.email, academia.nome, webUrl)
        .catch((err) => console.error('Error sending invite email:', err));
    }

    return {
      codigo: token,
      roleSugerido: dto.roleSugerido || UserRole.ALUNO,
      validoAte: expiresAt.toISOString(),
      academiaId: user.academiaId,
      inviteUrl: webUrl, // Return for display/sharing
    };
  }
}
