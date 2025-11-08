-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  coach BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Coaches can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND coach = TRUE
    )
  );

-- Create metrics table
CREATE TABLE public.metricas_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  peso DECIMAL(5,2),
  medidas JSONB DEFAULT '{}',
  energia INTEGER CHECK (energia >= 1 AND energia <= 5),
  sono DECIMAL(4,1),
  humor TEXT,
  data DATE DEFAULT CURRENT_DATE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.metricas_usuario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own metrics"
  ON public.metricas_usuario FOR ALL
  USING (auth.uid() = usuario_id);

CREATE POLICY "Coaches can view all metrics"
  ON public.metricas_usuario FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND coach = TRUE
    )
  );

-- Create training videos table
CREATE TABLE public.videos_treino (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  link_video TEXT NOT NULL,
  categoria TEXT NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.videos_treino ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view training videos"
  ON public.videos_treino FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Only coaches can manage training videos"
  ON public.videos_treino FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND coach = TRUE
    )
  );

-- Create completed trainings table
CREATE TABLE public.treinos_realizados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  treino_id UUID REFERENCES public.videos_treino(id) ON DELETE CASCADE,
  treino_nome TEXT,
  data DATE DEFAULT CURRENT_DATE,
  concluido BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.treinos_realizados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own completed trainings"
  ON public.treinos_realizados FOR ALL
  USING (auth.uid() = usuario_id);

CREATE POLICY "Coaches can view all completed trainings"
  ON public.treinos_realizados FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND coach = TRUE
    )
  );

-- Create daily check-ins table
CREATE TABLE public.checkins_diarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  sono DECIMAL(4,1),
  energia TEXT,
  humor TEXT,
  peso DECIMAL(5,2),
  treino_feito BOOLEAN DEFAULT FALSE,
  data DATE DEFAULT CURRENT_DATE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, data)
);

ALTER TABLE public.checkins_diarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own check-ins"
  ON public.checkins_diarios FOR ALL
  USING (auth.uid() = usuario_id);

CREATE POLICY "Coaches can view all check-ins"
  ON public.checkins_diarios FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND coach = TRUE
    )
  );

-- Create user challenges table
CREATE TABLE public.desafios_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  meta INTEGER NOT NULL,
  progresso INTEGER DEFAULT 0,
  porcentagem DECIMAL(5,2) DEFAULT 0,
  data_inicio DATE DEFAULT CURRENT_DATE,
  data_fim DATE,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.desafios_usuario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own challenges"
  ON public.desafios_usuario FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Coaches can manage all challenges"
  ON public.desafios_usuario FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND coach = TRUE
    )
  );

-- Create messages table
CREATE TABLE public.mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  texto TEXT NOT NULL,
  lida BOOLEAN DEFAULT FALSE,
  data_envio TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages"
  ON public.mensagens FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON public.mensagens FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Create trigger function to auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Create trigger for auto-creating profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update challenge progress
CREATE OR REPLACE FUNCTION public.update_challenge_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.desafios_usuario
  SET progresso = (
    SELECT COUNT(*)
    FROM public.treinos_realizados
    WHERE usuario_id = NEW.usuario_id
      AND data >= desafios_usuario.data_inicio
      AND (desafios_usuario.data_fim IS NULL OR data <= desafios_usuario.data_fim)
      AND concluido = TRUE
  ),
  porcentagem = CASE
    WHEN meta > 0 THEN
      ((SELECT COUNT(*)
        FROM public.treinos_realizados
        WHERE usuario_id = NEW.usuario_id
          AND data >= desafios_usuario.data_inicio
          AND (desafios_usuario.data_fim IS NULL OR data <= desafios_usuario.data_fim)
          AND concluido = TRUE)::DECIMAL / meta * 100)
    ELSE 0
  END
  WHERE usuario_id = NEW.usuario_id AND ativo = TRUE;
  
  RETURN NEW;
END;
$$;

-- Create trigger to update challenge progress on training completion
CREATE TRIGGER on_training_completed
  AFTER INSERT OR UPDATE ON public.treinos_realizados
  FOR EACH ROW
  EXECUTE FUNCTION public.update_challenge_progress();