-- CNN 공포탐욕 지수 저장 테이블
CREATE TABLE IF NOT EXISTS public.fear_and_greed (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL,
    score NUMERIC NOT NULL,
    rating VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 전략 A: 종목별 선행(Forward) 지표 트렌드 테이블
CREATE TABLE IF NOT EXISTS public.forward_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    ticker VARCHAR(10) NOT NULL,
    forward_eps NUMERIC,
    forward_pe NUMERIC,
    current_price NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, ticker) -- 하루에 종목당 한 줄만 들어가도록
);

-- 전략 B: 종목별 과거/후행(Trailing) P/E 시뮬레이션 기록 테이블
CREATE TABLE IF NOT EXISTS public.trailing_pe (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    ticker VARCHAR(10) NOT NULL,
    close_price NUMERIC,
    trailing_eps NUMERIC,
    trailing_pe NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, ticker)
);

-- ==========================================
-- ✅ Supabase 보안 경고 (RLS Disabled in Public) 해결을 위한 정책 설정
-- ==========================================

-- 1. fear_and_greed 테이블 RLS 활성화 및 권한 부여
ALTER TABLE public.fear_and_greed ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on fear_and_greed" ON public.fear_and_greed FOR SELECT USING (true);
CREATE POLICY "Allow public insert on fear_and_greed" ON public.fear_and_greed FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on fear_and_greed" ON public.fear_and_greed FOR UPDATE USING (true) WITH CHECK (true);

-- 2. forward_metrics 테이블 RLS 활성화 및 권한 부여
ALTER TABLE public.forward_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on forward_metrics" ON public.forward_metrics FOR SELECT USING (true);
CREATE POLICY "Allow public insert on forward_metrics" ON public.forward_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on forward_metrics" ON public.forward_metrics FOR UPDATE USING (true) WITH CHECK (true);

-- 3. trailing_pe 테이블 RLS 활성화 및 권한 부여
ALTER TABLE public.trailing_pe ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on trailing_pe" ON public.trailing_pe FOR SELECT USING (true);
CREATE POLICY "Allow public insert on trailing_pe" ON public.trailing_pe FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on trailing_pe" ON public.trailing_pe FOR UPDATE USING (true) WITH CHECK (true);
