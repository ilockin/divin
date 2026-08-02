-- Pagamentos reais: MB Way, Multibanco, PayPal, carteiras digitais e numerário.
--
-- O checkout passa de Checkout Session por redirecionamento para Stripe Elements na própria
-- página (Express Checkout Element para Apple Pay/Google Pay + Payment Element para os
-- restantes métodos), o que exige guardar o PaymentIntent em vez da sessão.
-- Idempotente.

-- Método efetivamente usado ('card', 'mbway', 'multibanco', 'paypal', 'numerario', ...):
-- até aqui a escolha do cliente era simplesmente ignorada e nada ficava registado.
alter table public.orders add column if not exists payment_method text;
alter table public.orders add column if not exists stripe_payment_intent_id text;

create index if not exists orders_payment_intent_idx on public.orders (stripe_payment_intent_id);

-- Necessárias para o servidor recalcular o montante a cobrar sem confiar em orders.total,
-- que é inserido pelo cliente: os portes vêm do método escolhido e o desconto é revalidado
-- contra a tabela de cupões.
alter table public.orders add column if not exists shipping_method_id text;
alter table public.orders add column if not exists coupon_code text;

-- Recolha na loja. Coluna própria em vez de comparar o id ou o nome do método: o admin pode
-- renomear ou criar métodos, e a regra que liberta o pagamento em numerário não pode depender
-- de uma string.
alter table public.shipping_methods add column if not exists is_pickup boolean not null default false;

update public.shipping_methods set is_pickup = true where id = 'sm3' and is_pickup = false;
