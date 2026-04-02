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
