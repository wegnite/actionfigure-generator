# Claude Code Instructions

## UI Design Guidelines

- Avoids using indigo or blue colors unless specified in the user's request
- Follows the cyberpunk/action figure aesthetic with orange, teal, purple, and green color schemes
- Maintains consistent design language across all components

## AI Model Configuration

### UltraThink Mode

- **Default Behavior**: Every Claude invocation automatically uses the **UltraThink** mode
- **Purpose**: Enhanced reasoning and deeper analysis for complex problems
- **Activation**: Enabled by default for all interactions in this project
- **Benefits**:
  - More thorough code analysis
  - Better problem-solving capabilities
  - Improved accuracy in technical implementations
  - Comprehensive understanding of project context

### Documentation Integration

- **Always Check Docs**: Claude Code should automatically reference the `/docs` and `/content/docs` directories for project-specific information
- **Context Awareness**: Use existing documentation to inform development decisions
- **Knowledge Base**: Leverage the comprehensive documentation suite including SEO guides, market research, and technical specifications

## Project: Action Figure AI Generator

This project is a **professional AI-powered Action Figure Generator platform** that targets the $97 billion collectibles and AI generation market. It has evolved from a basic template into a comprehensive SaaS platform with advanced features.

### Market Position

- **Target Market**: $97B global action figure and collectibles market
- **Differentiation**: AI-powered generation vs traditional manufacturing
- **Target Users**: Collectors, content creators, game developers, toy companies
- **Competitive Advantage**: Professional quality, instant generation, multi-language support

### Tech Stack

- **Framework**: Next.js 15.5.2 with App Router
- **Language**: TypeScript 5.7.2 (strict mode)
- **UI Library**: shadcn/ui (Radix UI + Tailwind CSS)
- **Authentication**: NextAuth.js 5.0
- **Database**: Supabase + Drizzle ORM
- **Payment**: Stripe (primary) + Creem (secondary)
- **AI Integration**: Multi-provider (OpenAI, DeepSeek, Kling, Replicate, OpenRouter)
- **Internationalization**: next-intl (8 languages)
- **Testing**: Jest + React Testing Library
- **Documentation**: Fumadocs

## Architecture Pattern: MVC-Service Layer

The project follows a **Three-tier Architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────┐
│            Presentation Layer (表现层)               │
│    Pages, Components, UI Elements                   │
└─────────────────────────────────────────────────────┘
                        ↕
┌─────────────────────────────────────────────────────┐
│         Business Logic Layer (业务逻辑层)            │
│    Services, API Routes, Business Rules             │
└─────────────────────────────────────────────────────┘
                        ↕
┌─────────────────────────────────────────────────────┐
│          Data Access Layer (数据访问层)              │
│    Models, Database Operations, Type Definitions    │
└─────────────────────────────────────────────────────┘
```

## Directory Structure & Responsibilities

### Core Application Directories

#### `/app` - Next.js App Router

Main application directory using Next.js 15 App Router pattern.

- **`/app/(legal)`** - Legal pages route group (privacy policy, terms)
  - Route group (parentheses don't appear in URL)
  - Access: `/privacy-policy`, `/terms-of-service`
- **`/app/[locale]`** - Internationalized routes (8 languages)

  - Dynamic segment for language support (en, zh, ja, es, fr, de, ar, it)
  - Access: `/en/...`, `/zh/...`, `/ja/...`, etc.
  - Contains:
    - `(default)` - Public pages
    - `(admin)` - Admin dashboard
    - `auth` - Authentication pages
    - `tutorial` - **NEW**: SEO-optimized tutorial pages

- **`/app/api`** - Backend API endpoints
  - `checkout/` - Stripe payment processing
  - `auth/[...nextauth]/` - NextAuth.js endpoints
  - `stripe-notify/` - Stripe webhook handler
  - `demo/` - Demo API endpoints for AI generation

### Documentation System

#### `/content/docs` - **NEW**: Comprehensive Documentation Center

Professional documentation suite covering all aspects of the project.

- **`/claude-guides`** - Claude AI usage guides

  - `Claude Agent大全.md` - Complete agent reference
  - `Claude Code自动化任务指南.md` - Automation guide
  - `Claude_Code提示词收集.md` - Prompt collection

- **`/development`** - Development guidelines

  - `development-checklist.md` - Complete development checklist
  - `完整项目指南.md` - Complete project guide

- **`/market-research`** - Market analysis

  - `竞对网站UX分析与差异化策略.md` - Competitive analysis

- **`/product-design`** - Product specifications

  - `AI动作人偶生成器PRD.md` - Product requirements document

- **`/seo`** - SEO strategy and implementation
  - `SEO完整实施指南.md` - Complete SEO implementation guide
  - `English-Marketing-Copy.md` - Marketing copy
  - `brand-copywriting-suite.md` - Brand copywriting suite
  - `seo-meta-content.md` - Meta content guide

#### `/docs` - **NEW**: Product roadmap and strategy

- `product-roadmap.md` - Complete product development roadmap
- `seo-keyword-strategy.md` - SEO keyword implementation strategy

### Business Logic Layer

#### `/services` - Business Services

Core business logic separated from presentation and data layers.

- **`credit.ts`** - Credits management

  - User credits calculation
  - Transaction handling
  - Credit types: NewUser, OrderPay, SystemAdd, Ping

- **`order.ts`** - Order processing

  - Order creation and management
  - Payment status tracking

- **`user.ts`** - User operations

  - User profile management
  - Authentication helpers

- **`affiliate.ts`** - Affiliate/referral system
- **`apikey.ts`** - API key management
- **`constant.ts`** - Business constants
- **`page.ts`** - Page content management
- **`context7.ts`** - **NEW**: Context7 documentation integration

### Data Access Layer

#### `/models` - Data Models

Database operations and data persistence.

- **`db.ts`** - Database connection configuration
- **`user.ts`** - User CRUD operations
- **`order.ts`** - Order database operations
- **`credit.ts`** - Credits table operations
- **`post.ts`** - Blog/content management
- **`feedback.ts`** - User feedback storage
- **`apikey.ts`** - API keys storage
- **`affiliate.ts`** - Affiliate data operations

### Presentation Layer

#### `/components` - React Components

- **`/ui`** - Base UI components (shadcn/ui)
  - Atomic components: Button, Card, Dialog, Form, etc.
- **`/blocks`** - Page sections/blocks
  - `hero/` - Landing page hero section
  - `pricing/` - Pricing tables and cards
  - `footer/` - Site footer
  - `header/` - Site header
  - `blog/` - Blog listing and detail
  - `showcase/` - Product showcase
  - `testimonial/` - Customer testimonials
  - `ai-generator/` - **NEW**: AI generation interface
- **`/character-figure`** - **NEW**: Core Action Figure Components

  - `ActionFigureGenerator.tsx` - Main generation interface
  - `CharacterFigureGenerator.tsx` - actiongeneration UI
  - `CharacterFigureGallery.tsx` - Public gallery
  - `CharacterFigureHero.tsx` - Hero sections
  - `CharacterPricingPage.tsx` - Pricing interface
  - `CharacterSubscriptionDashboard.tsx` - Subscription management
  - `CharacterVideoGenerator.tsx` - Video generation

- **`/console`** - Console/dashboard components
- **`/dashboard`** - Admin dashboard components
- **`/sign`** - Authentication components
- **`/analytics`** - Analytics integration

### Configuration & Types

#### `/types` - TypeScript Definitions

Type definitions for type safety across the application.

- **Core types**: `user.d.ts`, `order.d.ts`, `credit.d.ts`
- **Block types**: `/blocks/*.d.ts` - Component prop types
- **Slot types**: `/slots/*.d.ts` - Slot component types
- **Page types**: `/pages/*.d.ts` - Page-specific types
- **actiontypes**: **NEW**: Complete actionfigure type system
  - `CharacterFigureStyle` - 10 generation styles
  - `CharacterPose` - 10 pose options
  - `GenerationRequest/Response` - API interfaces

#### `/i18n` - Internationalization (8 Languages)

Multi-language support configuration.

- **Supported Languages**: en, zh, ja, es, fr, de, ar, it
- **`/messages`** - General translations with complete generator UI
- **`/pages`** - Page-specific translations
  - `/landing` - Landing page content (cyberpunk themed)
  - `/pricing` - Pricing page content
  - `/showcase` - Showcase page content
- **`routing.ts`** - i18n routing configuration
- **`locale.ts`** - Locale utilities

### AI Integration

#### `/aisdk` - **NEW**: Multi-Provider AI Integration

Custom AI service integrations with provider abstraction.

- **`/kling`** - Kling AI provider
  - Video generation
  - Image generation
  - Custom client implementation
- **`/generate-video`** - Video generation utilities
- **`/provider`** - Provider abstractions
- **`/types`** - AI-specific type definitions

**Supported Providers**:

- OpenAI (GPT, DALL-E)
- DeepSeek (Cost-effective alternative)
- Kling AI (Video + Image generation)
- Replicate (Multiple models)
- OpenRouter (Model routing)

### SEO Architecture

#### `/app/[locale]/tutorial` - **NEW**: Professional SEO Implementation

5 strategically optimized tutorial pages for maximum search visibility.

**Keyword Strategy**: "One keyword, one page" principle

- `/how-to-make-action-figure-ai/` - Primary keyword (880 searches/month)
- `/how-to-make-ai-action-figure/` - Secondary keyword (720 searches/month)
- `/how-to-make-the-ai-action-figure/` - Specific intent (390 searches/month)
- `/how-to-make-an-ai-action-figure/` - Universal method (260 searches/month)
- `/how-to-make-the-action-figure-ai/` - Success guide (170 searches/month)

**SEO Features**:

- Complete metadata optimization
- Structured data implementation
- Internal linking strategy
- Multi-language canonical URLs
- Professional content differentiation

### Supporting Directories

#### `/lib` - Utility Functions

- **`utils.ts`** - General utilities (cn function for className)
- **`hash.ts`** - Hashing and ID generation
- **`time.ts`** - Time/date utilities
- **`resp.ts`** - API response helpers
- **`cache.ts`** - Caching utilities
- **`storage.ts`** - Storage helpers

#### `/hooks` - React Hooks

- **`use-mobile.tsx`** - Mobile detection
- **`useMediaQuery.tsx`** - Media query hook
- **`useOneTapLogin.tsx`** - Google One-Tap login

#### `/auth` - Authentication Configuration

- **`config.ts`** - NextAuth.js configuration
- **`index.ts`** - Auth exports
- **`session.tsx`** - Session management

#### `/providers` - React Context Providers

- **`theme.tsx`** - Theme provider for dark/light mode

#### `/test` - **NEW**: Testing Infrastructure

- **`__tests__`** - Test files
- **`jest.config.js`** - Jest configuration
- **URL validation** - SEO URL testing

#### `/public` - Static Assets

- **`/imgs`** - Images organized by type
  - `/features` - Feature images
  - `/showcases` - Showcase images
  - `/users` - User avatars
  - `/logos` - Brand logos
  - `/icons` - Icon assets

## Key Configuration Files

### Root Configuration

- **`package.json`** - Dependencies and scripts
- **`tsconfig.json`** - TypeScript configuration (strict mode)
- **`next.config.mjs`** - Next.js configuration
- **`tailwind.config.ts`** - Tailwind CSS configuration
- **`components.json`** - shadcn/ui configuration
- **`middleware.ts`** - Next.js middleware (i18n routing)
- **`jest.config.js`** - **NEW**: Jest testing configuration

### Deployment Configuration

- **`vercel.json`** - Vercel deployment settings
- **`wrangler.toml.example`** - Cloudflare Workers config
- **`Dockerfile`** - Docker containerization
- **`pnpm-workspace.yaml`** - **NEW**: PNPM workspace configuration

### Development Configuration

- **`.env.example`** - Environment variables template
- **`postcss.config.mjs`** - PostCSS configuration
- **`.eslintrc.json`** - **NEW**: ESLint configuration

## Payment System (Stripe + Creem)

The payment system uses **dual payment processors** for maximum conversion:

1. **Checkout Initiation**: `/app/api/checkout/route.ts`

   - Creates Stripe checkout session
   - Validates pricing from configuration
   - Stores order in database
   - Supports multiple currencies (USD, CNY, etc.)

2. **Payment Processing**: Handled by processors

   - Stripe: International payments, subscriptions
   - Creem: Regional payment methods (WeChat Pay, Alipay)

3. **Webhook Handler**: `/app/api/stripe-notify/route.ts`

   - Receives payment confirmation
   - Updates order status
   - Adds credits to user account

4. **Success Page**: `/app/[locale]/pay-success/[session_id]/page.tsx`
   - Shows payment confirmation
   - Displays updated credits

## Credit System

Professional credit-based pricing model:

- **Standard Quality**: 15 credits per generation
- **HD Quality**: 25 credits per generation
- **Credit Sources**: New user bonus, purchases, system rewards, affiliate commissions

## Development Guidelines

### Code Organization Best Practices

1. **Separation of Concerns**

   - Keep business logic in `/services`
   - Database operations in `/models`
   - UI components in `/components`
   - AI integration in `/aisdk`
   - API routes handle HTTP concerns only

2. **Type Safety**

   - Define types in `/types`
   - Use strict TypeScript configuration
   - Avoid `any` types
   - Complete actionfigure type system

3. **Component Structure**

   - Atomic design for UI components
   - Blocks for page sections
   - Character-specific components in `/character-figure`
   - Slots for dynamic content areas

4. **API Design**

   - RESTful endpoints in `/app/api`
   - Use proper HTTP methods
   - Consistent error handling with `respErr` and `respData`
   - Multi-provider AI abstraction

5. **State Management**

   - React Context for global state
   - Server components for data fetching
   - Client components only when needed

6. **SEO Best Practices**

   - Follow "one keyword, one page" strategy
   - Complete metadata for all pages
   - Multi-language canonical URLs
   - Structured data implementation

7. **Internationalization**

   - Use next-intl for all text content
   - Support 8 languages completely
   - Localized URL structures
   - Cultural adaptation where needed

8. **Testing Strategy**
   - Unit tests for utilities and services
   - Component tests for UI elements
   - URL validation for SEO
   - Integration tests for critical paths

### Testing Commands

```bash
pnpm dev          # Development server with Turbopack
pnpm build        # Production build
pnpm lint         # Linting
pnpm test         # Run Jest tests
pnpm test:urls    # URL validation tests
pnpm analyze      # Bundle analysis
```

### Deployment Options

- **Vercel**: Primary deployment (optimized for Next.js)
- **Cloudflare**: Edge deployment with workers
- **Docker**: Self-hosted option

### AI Integration Guidelines

1. **Provider Abstraction**: Always use the provider abstraction layer in `/aisdk`
2. **Error Handling**: Implement robust error handling and fallback providers
3. **Cost Optimization**: Monitor usage and optimize for cost-effectiveness
4. **Quality Control**: Implement quality checks for generated content

### Documentation Usage

1. **Always Reference Docs**: Check `/content/docs` for existing guidance before implementing new features
2. **Market Research**: Use competitive analysis in `/content/docs/market-research` for feature decisions
3. **SEO Strategy**: Follow the complete SEO guide in `/content/docs/seo`
4. **Product Requirements**: Align with PRD in `/content/docs/product-design`

## Business Model

### Subscription Tiers

- **Free**: 10 generations/day, standard quality
- **Creator ($19/month)**: 100 generations/month, HD quality, commercial license
- **Professional ($49/month)**: 500 generations/month, batch processing, API access
- **Enterprise ($199/month)**: Unlimited generations, white-label, priority support

### Revenue Streams

1. **Subscription Revenue**: Primary revenue source
2. **Credit Purchases**: One-time credit packages
3. **API Revenue**: Usage-based API billing
4. **Affiliate Commissions**: Partner program

### Key Metrics

- **LTV:CAC**: Target 3:1 ratio
- **Churn Rate**: Target <5% monthly
- **Conversion Rate**: Free to paid target 5%+
- **ARPU**: Target $50+/month

This comprehensive guide ensures all development work aligns with the project's professional standards and business objectives.
