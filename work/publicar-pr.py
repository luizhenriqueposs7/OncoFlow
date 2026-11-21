import json
import subprocess
import urllib.request
import urllib.error

repo = 'Tragl56/MIT-Einstein-'
branch = 'codex/visual-refresh'
body = '''Atualiza a identidade visual do OncoFlow com logo em SVG inspirado na capa, orbe translúcido da Lia e nova apresentação do login e do app do paciente. A conversa por voz passa a ter início explícito da gravação, movimento pelo nível do microfone, revisão editável da transcrição antes do envio e alternativa por texto.

Preserva o redesenho do portal Pro já presente na main e ajusta os indicadores para telas estreitas. Mantém confirmações de ações, navegação nas respostas, instruções de urgência expandidas e convites de videochamada também no modo de voz. A gravação é encerrada ao cancelar ou navegar, e resultados atrasados são ignorados.

Validação realizada:

- `npm run lint`, `npm run build` e `git diff --check` passaram.
- Navegador com áudio sintético: medição real por Web Audio/MediaRecorder, revisão antes do envio, confirmação, cancelamento, permissão tardia, transcrição tardia e alternativa por texto.
- Testes de regressão para instruções de urgência e convite de chamada reproduzidos antes da correção e aprovados depois.
- Navegação e busca no Pro; layouts de 320, 390, 768 e 1440 px; voz com fonte ampliada e preferência de movimento reduzido.
- Revisão de código concluída sem achados críticos ou importantes pendentes.

A validação não usou microfone físico nem o fornecedor externo de transcrição; os eventos de síntese de fala foram simulados. O movimento da resposta falada acompanha eventos de reprodução/palavras, não uma medição acústica do TTS. Segue sendo uma demonstração com dados fictícios; esta alteração não implementa integrações hospitalares nem certifica conformidade para uso clínico. Backend, contratos de API e dependências permanecem iguais à main.'''

# Use the credential already configured for git push. Keep it only in memory.
credentials = subprocess.run(
    ['git', 'credential', 'fill'], input='protocol=https\nhost=github.com\n\n',
    text=True, capture_output=True, check=False, timeout=30
)
if credentials.returncode:
    raise SystemExit('Local Git authentication unavailable; no credentials printed.')
values = dict(line.split('=', 1) for line in credentials.stdout.splitlines() if '=' in line)
token = values.get('password')
if not token:
    raise SystemExit('No credential available; no credentials printed.')

def api(path, data=None):
    request = urllib.request.Request(
        f'https://api.github.com/repos/{repo}/{path}',
        data=json.dumps(data).encode('utf-8') if data is not None else None,
        headers={'Authorization': f'Bearer {token}', 'Accept': 'application/vnd.github+json',
                 'Content-Type': 'application/json', 'User-Agent': 'OncoFlow-repository-publication',
                 'X-GitHub-Api-Version': '2022-11-28'}
    )
    try:
        with urllib.request.urlopen(request, timeout=40) as response:
            return json.load(response)
    except urllib.error.HTTPError as error:
        detail = json.loads(error.read().decode('utf-8'))
        raise SystemExit(f'GitHub API HTTP {error.code}: {detail.get("message", "Request failed")}')

existing = api('pulls?state=open&head=Tragl56%3Acodex%2Fvisual-refresh')
pr = existing[0] if existing else api('pulls', {
    'title': 'Atualiza identidade do OncoFlow e experiência de voz da Lia',
    'head': branch, 'base': 'main', 'body': body, 'draft': False, 'maintainer_can_modify': True
})
print(json.dumps({key: pr.get(key) for key in ['number', 'html_url', 'state', 'draft']}, ensure_ascii=False))
