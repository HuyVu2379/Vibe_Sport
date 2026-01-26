import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SocketService } from './socket.service';
import { AppGateway } from './app.gateway';
import { SOCKET_SERVICE } from '../../application/ports/socket.service.port';

@Global()
@Module({
    imports: [
        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('jwt.secret'),
                signOptions: {
                    expiresIn: configService.get<string>('jwt.expiresIn'),
                },
            }),
        }),
    ],
    providers: [
        SocketService,
        AppGateway,
        {
            provide: SOCKET_SERVICE,
            useExisting: SocketService,
        },
    ],
    exports: [SocketService, SOCKET_SERVICE],
})
export class SocketModule { }
