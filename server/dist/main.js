"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chats = exports.messagesByChat = exports.users = void 0;
require("reflect-metadata");
const path = __importStar(require("path"));
const express = __importStar(require("express"));
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const core_1 = require("@nestjs/core");
const websockets_1 = require("@nestjs/websockets");
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
const socket_io_1 = require("socket.io");
const JWT_SECRET = 'mock-secret-key-for-dev-only';
const ACCESS_TOKEN_TTL = '1h';
const REFRESH_TOKEN_TTL = '7d';
// ─── In-memory DB ─────────────────────────────────────────────────────────────
exports.users = [
    { userId: 'u1', userName: 'Stepan', password: 'pass123', isOnline: true },
    { userId: 'u2', userName: 'Alex', password: 'pass123', isOnline: true },
    { userId: 'u3', userName: 'Maria', password: 'pass123', isOnline: false },
    { userId: 'u4', userName: 'Denis', password: 'pass123', isOnline: true },
    { userId: 'u5', userName: 'Olga', password: 'pass123', isOnline: false },
];
exports.messagesByChat = {
    // Stepan ↔ Alex
    c1: [
        {
            id: 'msg-c1-1',
            chatId: 'c1',
            senderId: 'u2',
            text: 'Привет! Как дела?',
            createdAt: '2026-04-10T08:00:00.000Z',
        },
        {
            id: 'msg-c1-2',
            chatId: 'c1',
            senderId: 'u1',
            text: 'Отлично, работаю над проектом!',
            createdAt: '2026-04-10T08:01:00.000Z',
        },
        {
            id: 'msg-c1-3',
            chatId: 'c1',
            senderId: 'u2',
            text: 'Интересно, расскажи подробнее',
            createdAt: '2026-04-10T08:02:00.000Z',
        },
    ],
    // Stepan ↔ Maria
    c2: [
        {
            id: 'msg-c2-1',
            chatId: 'c2',
            senderId: 'u1',
            text: 'Мария, ты сегодня онлайн?',
            createdAt: '2026-04-09T18:00:00.000Z',
        },
        {
            id: 'msg-c2-2',
            chatId: 'c2',
            senderId: 'u3',
            text: 'Да, только зашла',
            createdAt: '2026-04-09T18:05:00.000Z',
        },
    ],
    // Stepan ↔ Denis
    c3: [
        {
            id: 'msg-c3-1',
            chatId: 'c3',
            senderId: 'u4',
            text: 'Денис здесь',
            createdAt: '2026-04-08T12:00:00.000Z',
        },
        {
            id: 'msg-c3-2',
            chatId: 'c3',
            senderId: 'u1',
            text: 'Привет Денис!',
            createdAt: '2026-04-08T12:01:00.000Z',
        },
    ],
    // Stepan ↔ Olga
    c4: [
        {
            id: 'msg-c4-1',
            chatId: 'c4',
            senderId: 'u5',
            text: 'Можем созвониться?',
            createdAt: '2026-04-07T15:00:00.000Z',
        },
        {
            id: 'msg-c4-2',
            chatId: 'c4',
            senderId: 'u1',
            text: 'Конечно, когда?',
            createdAt: '2026-04-07T15:02:00.000Z',
        },
    ],
    // Alex ↔ Maria
    c5: [
        {
            id: 'msg-c5-1',
            chatId: 'c5',
            senderId: 'u3',
            text: 'Alex, видел новый релиз?',
            createdAt: '2026-04-10T09:00:00.000Z',
        },
        {
            id: 'msg-c5-2',
            chatId: 'c5',
            senderId: 'u2',
            text: 'Да, уже смотрю!',
            createdAt: '2026-04-10T09:05:00.000Z',
        },
    ],
    // Alex ↔ Denis
    c6: [
        {
            id: 'msg-c6-1',
            chatId: 'c6',
            senderId: 'u2',
            text: 'Denis, встреча в 15:00?',
            createdAt: '2026-04-09T10:00:00.000Z',
        },
        {
            id: 'msg-c6-2',
            chatId: 'c6',
            senderId: 'u4',
            text: 'Буду',
            createdAt: '2026-04-09T10:02:00.000Z',
        },
    ],
    // Alex ↔ Olga
    c7: [
        {
            id: 'msg-c7-1',
            chatId: 'c7',
            senderId: 'u5',
            text: 'Привет! Как проект?',
            createdAt: '2026-04-08T16:00:00.000Z',
        },
        {
            id: 'msg-c7-2',
            chatId: 'c7',
            senderId: 'u2',
            text: 'В процессе',
            createdAt: '2026-04-08T16:10:00.000Z',
        },
    ],
};
exports.chats = [
    {
        id: 'c1',
        participantIds: ['u1', 'u2'],
        lastMessage: exports.messagesByChat['c1'][exports.messagesByChat['c1'].length - 1],
        updatedAt: '2026-04-10T08:02:00.000Z',
        unreadCount: 1,
    },
    {
        id: 'c2',
        participantIds: ['u1', 'u3'],
        lastMessage: exports.messagesByChat['c2'][exports.messagesByChat['c2'].length - 1],
        updatedAt: '2026-04-09T18:05:00.000Z',
        unreadCount: 0,
    },
    {
        id: 'c3',
        participantIds: ['u1', 'u4'],
        lastMessage: exports.messagesByChat['c3'][exports.messagesByChat['c3'].length - 1],
        updatedAt: '2026-04-08T12:01:00.000Z',
        unreadCount: 0,
    },
    {
        id: 'c4',
        participantIds: ['u1', 'u5'],
        lastMessage: exports.messagesByChat['c4'][exports.messagesByChat['c4'].length - 1],
        updatedAt: '2026-04-07T15:02:00.000Z',
        unreadCount: 0,
    },
    {
        id: 'c5',
        participantIds: ['u2', 'u3'],
        lastMessage: exports.messagesByChat['c5'][exports.messagesByChat['c5'].length - 1],
        updatedAt: '2026-04-10T09:05:00.000Z',
        unreadCount: 1,
    },
    {
        id: 'c6',
        participantIds: ['u2', 'u4'],
        lastMessage: exports.messagesByChat['c6'][exports.messagesByChat['c6'].length - 1],
        updatedAt: '2026-04-09T10:02:00.000Z',
        unreadCount: 0,
    },
    {
        id: 'c7',
        participantIds: ['u2', 'u5'],
        lastMessage: exports.messagesByChat['c7'][exports.messagesByChat['c7'].length - 1],
        updatedAt: '2026-04-08T16:10:00.000Z',
        unreadCount: 0,
    },
];
const userDetails = {
    u1: {
        email: 'stepan@example.com',
        phone: '+7 (999) 111-11-11',
        location: 'Москва, Россия',
        stats: { contacts: 4, chats: 4, messages: 142 },
    },
    u2: {
        email: 'alex@example.com',
        phone: '+7 (999) 222-22-22',
        location: 'Санкт-Петербург, Россия',
        stats: { contacts: 3, chats: 3, messages: 87 },
    },
    u3: {
        email: 'maria@example.com',
        phone: '+7 (999) 333-33-33',
        location: 'Казань, Россия',
        stats: { contacts: 2, chats: 2, messages: 54 },
    },
    u4: {
        email: 'denis@example.com',
        phone: '+7 (999) 444-44-44',
        location: 'Новосибирск, Россия',
        stats: { contacts: 2, chats: 2, messages: 31 },
    },
    u5: {
        email: 'olga@example.com',
        phone: '+7 (999) 555-55-55',
        location: 'Екатеринбург, Россия',
        stats: { contacts: 2, chats: 2, messages: 28 },
    },
};
// ─── Auth Controller ───────────────────────────────────────────────────────────
let AuthController = class AuthController {
    jwtService;
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    login(body) {
        const user = exports.users.find(u => u.userName === body.userName && u.password === body.password);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = { userId: user.userId, userName: user.userName };
        return {
            accessToken: this.jwtService.sign(payload, { expiresIn: ACCESS_TOKEN_TTL }),
            refreshToken: this.jwtService.sign(payload, { expiresIn: REFRESH_TOKEN_TTL }),
            user: {
                userId: user.userId,
                userName: user.userName,
                isOnline: user.isOnline,
            },
        };
    }
    refresh(body) {
        try {
            const decoded = this.jwtService.verify(body.refreshToken);
            const user = exports.users.find(u => u.userId === decoded.userId);
            if (!user) {
                throw new common_1.UnauthorizedException('Invalid token');
            }
            const payload = { userId: user.userId, userName: user.userName };
            return {
                accessToken: this.jwtService.sign(payload, { expiresIn: ACCESS_TOKEN_TTL }),
                refreshToken: this.jwtService.sign(payload, { expiresIn: REFRESH_TOKEN_TTL }),
            };
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
};
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], AuthController.prototype, "refresh", null);
AuthController = __decorate([
    (0, common_1.Controller)('api/auth'),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], AuthController);
// ─── Chats Controller ─────────────────────────────────────────────────────────
let ChatsController = class ChatsController {
    jwtService;
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    getChats(authHeader) {
        const token = authHeader?.replace('Bearer ', '');
        let userId;
        try {
            ({ userId } = this.jwtService.verify(token, { secret: JWT_SECRET }));
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
        return exports.chats
            .filter(chat => chat.participantIds.includes(userId))
            .map(chat => {
            const otherUserId = chat.participantIds.find(id => id !== userId);
            const participant = exports.users.find(u => u.userId === otherUserId);
            return {
                id: chat.id,
                participant: {
                    userId: participant.userId,
                    userName: participant.userName,
                    isOnline: participant.isOnline,
                },
                lastMessage: chat.lastMessage,
                updatedAt: chat.updatedAt,
                unreadCount: chat.unreadCount,
            };
        });
    }
    getMessages(authHeader, chatId) {
        const token = authHeader?.replace('Bearer ', '');
        let userId;
        try {
            ({ userId } = this.jwtService.verify(token, { secret: JWT_SECRET }));
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
        const chat = exports.chats.find(c => c.id === chatId);
        if (!chat?.participantIds.includes(userId)) {
            return [];
        }
        return exports.messagesByChat[chatId] ?? [];
    }
};
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Array)
], ChatsController.prototype, "getChats", null);
__decorate([
    (0, common_1.Get)(':id/messages'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Array)
], ChatsController.prototype, "getMessages", null);
ChatsController = __decorate([
    (0, common_1.Controller)('api/chats'),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], ChatsController);
// ─── User Controller ──────────────────────────────────────────────────────────
let UserController = class UserController {
    jwtService;
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    getDetails(authHeader, userId) {
        const token = authHeader?.replace('Bearer ', '');
        try {
            this.jwtService.verify(token, { secret: JWT_SECRET });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
        const user = exports.users.find(u => u.userId === userId);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const details = userDetails[userId] ?? {
            email: '',
            phone: '',
            location: '',
            stats: { contacts: 0, chats: 0, messages: 0 },
        };
        return {
            userId: user.userId,
            userName: user.userName,
            isOnline: user.isOnline,
            ...details,
        };
    }
};
__decorate([
    (0, common_1.Get)(':id/details'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Object)
], UserController.prototype, "getDetails", null);
UserController = __decorate([
    (0, common_1.Controller)('api/user'),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], UserController);
// ─── WebSocket Gateway ────────────────────────────────────────────────────────
let MessagesGateway = class MessagesGateway {
    jwtService;
    server;
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    handleConnection(client) {
        try {
            const token = client.handshake.auth['token'];
            const payload = this.jwtService.verify(token, {
                secret: JWT_SECRET,
            });
            client.data['userId'] = payload.userId;
            const user = exports.users.find(u => u.userId === payload.userId);
            if (user)
                user.isOnline = true;
            const userChats = exports.chats.filter(c => c.participantIds.includes(payload.userId));
            userChats.forEach(chat => client.join(`chat:${chat.id}`));
            client.broadcast.emit('user:online', { userId: payload.userId });
        }
        catch {
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        const userId = client.data['userId'];
        if (userId) {
            const user = exports.users.find(u => u.userId === userId);
            if (user)
                user.isOnline = false;
            client.broadcast.emit('user:offline', { userId });
        }
    }
    handleMessageSend(client, payload) {
        const senderId = client.data['userId'];
        const message = {
            id: `msg-${Date.now()}`,
            chatId: payload.chatId,
            senderId,
            text: payload.text,
            createdAt: new Date().toISOString(),
        };
        if (!exports.messagesByChat[payload.chatId]) {
            exports.messagesByChat[payload.chatId] = [];
        }
        exports.messagesByChat[payload.chatId].push(message);
        const chat = exports.chats.find(c => c.id === payload.chatId);
        if (chat) {
            chat.lastMessage = message;
            chat.updatedAt = message.createdAt;
        }
        this.server.to(`chat:${payload.chatId}`).emit('message:new', {
            chatId: payload.chatId,
            message,
        });
    }
    handleTypingStart(client, payload) {
        const userId = client.data['userId'];
        client
            .to(`chat:${payload.chatId}`)
            .emit('typing', { chatId: payload.chatId, userId, isTyping: true });
    }
    handleTypingStop(client, payload) {
        const userId = client.data['userId'];
        client
            .to(`chat:${payload.chatId}`)
            .emit('typing', { chatId: payload.chatId, userId, isTyping: false });
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], MessagesGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('message:send'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], MessagesGateway.prototype, "handleMessageSend", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing:start'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], MessagesGateway.prototype, "handleTypingStart", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing:stop'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], MessagesGateway.prototype, "handleTypingStop", null);
MessagesGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: { origin: '*' } }),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], MessagesGateway);
// ─── App Module ───────────────────────────────────────────────────────────────
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            jwt_1.JwtModule.register({
                secret: JWT_SECRET,
                signOptions: { expiresIn: ACCESS_TOKEN_TTL },
            }),
        ],
        controllers: [AuthController, ChatsController, UserController],
        providers: [MessagesGateway],
    })
], AppModule);
async function bootstrap() {
    const app = await core_1.NestFactory.create(AppModule);
    app.useWebSocketAdapter(new platform_socket_io_1.IoAdapter(app));
    app.enableCors({ origin: '*' });
    // Init registers NestJS routes BEFORE we add the catch-all
    await app.init();
    // Add static serving AFTER NestJS routes so /api/* is handled by NestJS first
    const staticDir = path.resolve(__dirname, '..', '..', 'dist', 'messenger-client', 'browser');
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.use(express.static(staticDir));
    expressApp.use((_req, res) => {
        res.sendFile(path.join(staticDir, 'index.html'));
    });
    const port = process.env['PORT'] ?? 3000;
    await app.getHttpServer().listen(port);
    console.log(`Server running on port ${port}`);
}
bootstrap();
