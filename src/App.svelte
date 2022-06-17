<script lang="ts">
  import Exploit from './exploit.svelte';
  import { DoubleBounce as Loader } from 'svelte-loading-spinners';
  import type { IExploitInfo, IRobloxInfo } from './ExploitInfo';
  export let api: string;
  let fetching: boolean = true;
  let apiResponse: IExploitInfo[] = [];
  let RbxInfo: IRobloxInfo;
  let err: any;
  let attempt = 0;
  const getQueryVariable = variable => {
    const query = window.location.search.substring(1);
    const vars = query.split('&');
    for (let i = 0; i < vars.length; i++) {
      const pair = vars[i].split('=');
      if (decodeURIComponent(pair[0]) == variable) {
        return decodeURIComponent(pair[1]);
      }
    }
  };
  const update = async () => {
    try {
      fetching = true;
      const _ApiResponse = await (await fetch(api)).json();
      apiResponse = [];
      for (const k in _ApiResponse) {
        if (Object.prototype.hasOwnProperty.call(_ApiResponse, k)) {
          const data = _ApiResponse[k];
          for (const exploitName in data) {
            if (
              Object.prototype.hasOwnProperty.call(data, exploitName) &&
              exploitName !== 'ROBLOX'
            ) {
              const exploitInfo = data[exploitName];
              apiResponse.push({
                name: exploitName,
                ...exploitInfo,
              });
            } else if (exploitName === 'ROBLOX')
              RbxInfo = {
                ...data[exploitName],
                last_update: new Date(
                  Number(data[exploitName].last_update_unix) * 1000,
                ),
              };
          }
        }
      }
      apiResponse = apiResponse.sort((a, b) => {
        if (a.updated) {
          if (!b.updated) return -1; // b didnt update; push b down
          return a.last_update_unix > b.last_update_unix ? 1 : -1; // sort by which updated first
        } else if (b.updated) {
          return 1; // b updated, but a not
        } else {
          return 0; // neither updated
        }
      });
      if (apiResponse.length > 0 && getQueryVariable('only')) {
        const mappings = {
          wrd: 'wearedevsapi',
          'scriptware.com': 'scriptware',
          sw: 'scriptware',
          scriptwater: 'scriptware',
          rw: 'roware',
          row: 'roware',
          rowater: 'roware',
          flx: 'fluxus',
          flux: 'fluxus',
          fluxteam: 'fluxus',
          'fluxteam.xyz': 'fluxus',
          'temple.cx': 'temple',
          tmpl: 'temple',
          oxyu: 'oxygen',
          oxygenu: 'oxygen',
          oxy: 'oxygen',
          vs: 'vsevere',
          com: 'comet',
          dx: 'dx9ware',
          dx9: 'dx9ware',
          el: 'electron',
        };
        const normalise = v => v.trim().replace(/[ \-]/gi, '').toLowerCase();
        const allowed = getQueryVariable('only')
          .split(',')
          .map(v => normalise(v))
          .map(v => mappings[v] ?? v);
        apiResponse = apiResponse.filter(v =>
          allowed.includes(normalise(v.name)),
        );
        if (apiResponse.length <= 0)
          throw new Error(
            'Query only passed with execs:\n' +
              allowed.join(', ') +
              '\nHowever, none matched those returned by the API',
          );
      }
      if (getQueryVariable('nopatched') && apiResponse.length <= 0) {
        apiResponse = [
          {
            exploit_version: '',
            last_update: '',
            last_update_unix: 0,
            name: 'All Exploits are Patched',
            updated: false,
            hidetag: true,
            lines: [
              'Found nopatched query, yet all executors matching your query',
              'are currently patched.\nPlease try again later.',
            ],
          },
        ];
      }
      const attribMappings: Record<string, Partial<IExploitInfo>> = {
        'wearedevs api': {
          hidetag: true,
          name: 'WeAreDevs (API)',
        },
        oxygen: {
          name: 'Oxygen-U',
        },
        'v-severe': {
          hidden: true,
        },
        dx9ware: {
          name: 'DX9Ware',
        },
      };
      apiResponse = apiResponse.map(v => ({
        ...v,
        ...(attribMappings[v.name.toLowerCase()] ?? {}),
      }));
      console.groupCollapsed('Updated Info');
      console.log('RBX:', RbxInfo);
      apiResponse.forEach(data => console.log(data.name + ':', data));
      console.groupEnd();
      // @ts-expect-error
      window.RobloxInfo = RbxInfo;
      // @ts-expect-error
      window.ExploitInfo = apiResponse;
      err = null;
      fetching = false;
      setTimeout(update, 10000); // next update in 10s
    } catch (e) {
      console.groupCollapsed('Error Updating');
      console.error(e);
      console.groupEnd();
      err = e ?? 'No Error Specified';
      setTimeout(() => {
        // clear after showing message for a bit
        fetching = false;
        if (apiResponse.length <= 0) attempt++;
      }, 500);
      setTimeout(update, 4000); // next attempt in 2s
    }
  };
  update();
  let _cell = -1;
  const newRow = () => {
    _cell++;
    if (_cell >= 3) _cell = 0;
    return _cell == 0;
  };
  // @ts-expect-error
  window.update = update;
</script>

<main
  data-app-name-short="WAEPT"
  data-app="WAEPT"
  data-app-name-long="What Are Exploits' Patch Times"
  aria-label="Main Content"
>
  <h1 aria-label="Title">WAEPT</h1>
  <p class="👋" aria-label="Welcome Message">What Are Exploits' Patch Times</p>
  <div class="content" aria-label="Content Container">
    <div>
      {#if fetching}
        {#if apiResponse.length > 0}
          <div
            class="⧈ APIResponse"
            aria-label="Updating Exploit Information..."
          >
            <p>Updating Information...</p>
          </div>
        {:else}
          <div class="APIResponse" aria-label="Getting Exploit Information">
            <div>
              <div style="justify-content: center; display: flex">
                <Loader />
              </div>
              <br />
              <p>
                {attempt === 0
                  ? 'Waiting for API Response...'
                  : 'Trying to contact the API (Retry Attempt ' + attempt + ')'}
              </p>
              {#if attempt !== 0}
                <p>If the problem persists, check your internet connection.</p>
              {/if}
            </div>
          </div>
        {/if}
      {/if}
      {#if err}
        <div
          class="⧈ Error⧈"
          aria-label="Error Information"
          aria-live="assertive"
        >
          <h3 aria-label="Error Summary">
            An uncaught exception has ocurred while fetching information from
            the API
          </h3>
          <p aria-label="Error Description Information">
            Details:<br /><code>{err.toString()}</code>
          </p>
        </div>
      {/if}
      {#if RbxInfo}
        <div class="⧈ ⛶" aria-label="Roblox Information" aria-live="polite">
          <h2>Roblox</h2>
          <p aria-label="Roblox Version: {RbxInfo.version}">
            Version: {RbxInfo.version}
          </p>
          <p class="🔺" aria-label="Roblox Last Updated Information">
            Last Update: {RbxInfo.last_update.getFullYear()}-{(
              RbxInfo.last_update.getMonth() + 1
            ).toString()}-{RbxInfo.last_update.getDay().toString()} ({RbxInfo.last_update_unix})
          </p>
        </div>
      {/if}
      <!-- {#if apiResponse && apiResponse.length > 0} -->
      <div class="🗋" aria-label="Exploit List Container" aria-live="polite">
        {#each apiResponse as ExploitInfo}
          {#if newRow()}
            <div class="♥" />
          {/if}
          <Exploit {ExploitInfo} RobloxInfo={RbxInfo} />
        {/each}
      </div>
      <!-- {/if} -->
    </div>
  </div>
</main>
<footer
  style="width: max-content; max-width: max-content; left: 50vw; position: absolute; transform:translate(-50%,0)"
>
  <p style="width: max-content">
    <code
      style="background: #000000{apiResponse.length > 0
        ? '66'
        : '22'}; padding: 8px 8px; border-radius:4px; display:inline-block; width: max-content;"
      ><a
        href={api}
        target="_blank"
        aria-label="API URL"
        style="color: #ff3e00 !important">{api}</a
      ></code
    >
  </p>
</footer>

<style lang="scss">
  @media screen and (max-width: 1024px) {
    .♥ {
      display: none;
    }
  }
  /* .🗋 {
    display: table;
  } */
  .⧈.⛶ {
    /* Roblox Container */
    text-align: center;
    --border-colour: rgb(0, 60, 255);
    --hover-bg: rgb(0, 23, 97);
    p {
      margin-top: 4px;
      margin-bottom: 4px;
    }
    .🔺 {
      margin-bottom: 24px;
    }
  }
  .⧈.Error⧈ {
    /* Error Container */
    --border-colour: #ff3e00;
    --hover-bg: #5e1700;
    background: #331a1a;
  }
  .⧈.APIResponse {
    --border-colour: #0099ff;
    --hover-bg: #002d4b;
    background: #1a2833;
    text-align: center;
  }
  .APIResponse:not(.⧈) {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    & > div {
      position: fixed;
      top: 50vh;
      left: 50vw;
      transform: translate(-50%, -50%);
      color: rgb(255, 166, 137);
    }
    background: #2a2b2caa;
  }
  .⧈ {
    padding: 2px 16px;
    margin: 4px 4px;
    border-radius: 16px;
    border: 2px solid var(--border-colour, #0000ff);
    transition: background 1s, border-color 1s;
    --hover-bg: transparent;
  }
  .⧈:hover {
    background: var(--hover-bg, transparent) !important;
  }
  .content {
    display: flex;
    justify-content: center;
  }
  main,
  footer {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }
  .👋 {
    color: #ff6b3a;
    font-weight: 100;
    font-size: 2em;
  }

  @media (min-width: 1410px) {
    main {
      max-width: none;
    }
    .⧈ {
      text-align: left;
    }
  }
  @media (max-width: 1410px) {
    .⧈ {
      text-align: center;
    }
  }
</style>
