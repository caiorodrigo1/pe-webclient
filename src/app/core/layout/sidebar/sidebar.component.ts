import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
  OnInit,
  OnDestroy,
  Input,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { slideToggle, slideUp } from 'src/app/shared/util/slide-menu.util';

import { ValidaComponentService } from 'src/app/shared/services/valida-component.service';
import { DataService } from 'src/app/shared/services/data.service';
import { TotalizadorService } from 'src/app/shared/services/totalizador.service';
import appSettings from 'src/app/shared/mocks/app-settings';
import appMenus from 'src/app/shared/mocks/app-menu';
import { IUsuarioLogado } from 'src/app/shared/models/usuarioLogado.model';
import {
  ITotalizador,
  Totalizador,
} from 'src/app/shared/models/totalizador.model';

@Component({
  selector: 'top-sidebar',
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() usuario?: IUsuarioLogado;
  @Output() appSidebarMinifiedToggled = new EventEmitter<boolean>();
  @Output() alternarClicado = new EventEmitter();

  totalizador: ITotalizador = new Totalizador();
  //usuario: string = 'Usuario Logado';
  //cargo: string = 'Colaborador';

  inscricaoTotalizador?: Subscription;

  logoSidebar: string = '/assets/img/layout/LogoTop-transparente.png';
  altSidebar: string = 'Logomarca da Top Solutions';

  menus = appMenus;
  appSettings = appSettings;
  appSidebarFloatSubMenu = '';
  appSidebarFloatSubMenuHide = setTimeout(() => {});
  appSidebarFloatSubMenuHideTime = 250;
  appSidebarFloatSubMenuTop = '';
  appSidebarFloatSubMenuLeft = '60px';
  appSidebarFloatSubMenuRight = '';
  appSidebarFloatSubMenuBottom = '';
  appSidebarFloatSubMenuArrowTop = '';
  appSidebarFloatSubMenuArrowBottom = '';
  appSidebarFloatSubMenuLineTop = '';
  appSidebarFloatSubMenuLineBottom = '';
  appSidebarFloatSubMenuOffset: any;

  mobileMode = false;
  desktopMode = true;
  scrollTop = 0;

  acessoAdministrador = false;

  constructor(
    private eRef: ElementRef,
    private validaComponentService: ValidaComponentService,
    private dataService: DataService,
    protected router: Router,
    private totalizadorService: TotalizadorService
  ) {
    if (window.innerWidth <= 767) {
      this.mobileMode = true;
      this.desktopMode = false;
    } else {
      this.mobileMode = false;
      this.desktopMode = true;
    }
  }

  ngOnInit(): void {
    this.atualizarTotalizadores();
    //this.logoSidebar = `data:image/png;base64,${this.usuario.logo}`;
    this.logoSidebar = `/assets/img/logo-cliente.png`;
    this.ocultarItensMenus(this.acessoAdministrador);
  }

  ngOnDestroy(): void {
    if (this.inscricaoTotalizador) this.inscricaoTotalizador.unsubscribe();
  }

  private atualizarTotalizadores(): void {
    this.totalizador = new Totalizador();
    this.inscricaoTotalizador = this.totalizadorService
      .lerTotalizador()
      .subscribe((resposta) => {
        this.totalizador = resposta;
        this.atualizarBadges_Menu();
      });
  }

  private atualizarBadges_Menu(): void {
    const SUBMENUS_MAP = {
      Tramitados: 'tramitados',
      'Não Tramitados': 'naoTramitados',
      Favoritos: 'favoritos',
    };

    const menuProcesso = this.menus.find((menu) => menu.title === 'Processo');
    if (menuProcesso) {
      menuProcesso.badge = `${this.totalizador?.total || 0}`;

      //Atualiza as propriedades 'badge' dos submenus
      for (const submenuTitle in SUBMENUS_MAP) {
        if (submenuTitle in SUBMENUS_MAP) {
          const submenuKey = (SUBMENUS_MAP as Record<string, string>)[
            submenuTitle
          ];
          const submenu = menuProcesso.submenu.find(
            (menu) => menu.title === submenuTitle
          );
          if (submenu) {
            const total = (this.totalizador as Record<string, string>)[
              submenuKey || 0
            ];
            submenu.badge = `${total}`;
          }
        }
      }
    }
  }

  // protected toggleNavProfile(e: any): void {
  //   e.preventDefault();

  //   var targetSidebar = <HTMLElement>(
  //     document.querySelector('.app-sidebar:not(.app-sidebar-end)')
  //   );
  //   var targetMenu = e.target.closest('.menu-profile');
  //   var targetProfile = <HTMLElement>(
  //     document.querySelector('#appSidebarProfileMenu')
  //   );
  //   var expandTime =
  //     targetSidebar &&
  //     targetSidebar.getAttribute('data-disable-slide-animation')
  //       ? 0
  //       : 250;

  //   if (targetProfile && targetProfile.style) {
  //     if (targetProfile.style.display == 'block') {
  //       targetMenu.classList.remove('active');
  //     } else {
  //       targetMenu.classList.add('active');
  //     }
  //     slideToggle(targetProfile, expandTime);
  //     targetProfile.classList.toggle('expand');
  //   }
  // }

  toggleAppSidebarMinified() {
    this.appSidebarMinifiedToggled.emit(true);
    this.scrollTop = 40;
  }

  calculateAppSidebarFloatSubMenuPosition() {
    console.log('usou');
    var targetTop = this.appSidebarFloatSubMenuOffset.top;
    var direction = document.body.style.direction;
    var windowHeight = window.innerHeight;

    setTimeout(() => {
      let targetElm = <HTMLElement>(
        document.querySelector('.app-sidebar-float-submenu-container')
      );
      let targetSidebar = <HTMLElement>document.getElementById('sidebar');
      var targetHeight = targetElm.offsetHeight;
      this.appSidebarFloatSubMenuRight = 'auto';
      this.appSidebarFloatSubMenuLeft =
        this.appSidebarFloatSubMenuOffset.width +
        targetSidebar.offsetLeft +
        'px';

      if (windowHeight - targetTop > targetHeight) {
        this.appSidebarFloatSubMenuTop =
          this.appSidebarFloatSubMenuOffset.top + 'px';
        this.appSidebarFloatSubMenuBottom = 'auto';
        this.appSidebarFloatSubMenuArrowTop = '20px';
        this.appSidebarFloatSubMenuArrowBottom = 'auto';
        this.appSidebarFloatSubMenuLineTop = '20px';
        this.appSidebarFloatSubMenuLineBottom = 'auto';
      } else {
        this.appSidebarFloatSubMenuTop = 'auto';
        this.appSidebarFloatSubMenuBottom = '0';

        var arrowBottom = windowHeight - targetTop - 21;
        this.appSidebarFloatSubMenuArrowTop = 'auto';
        this.appSidebarFloatSubMenuArrowBottom = arrowBottom + 'px';
        this.appSidebarFloatSubMenuLineTop = '20px';
        this.appSidebarFloatSubMenuLineBottom = arrowBottom + 'px';
      }
    }, 0);
  }

  protected showAppSidebarFloatSubMenu(menu: any, e: any): void {
    if (this.appSettings.appSidebarMinified) {
      clearTimeout(this.appSidebarFloatSubMenuHide);

      this.appSidebarFloatSubMenu = menu;
      this.appSidebarFloatSubMenuOffset = e.target.getBoundingClientRect();
      this.calculateAppSidebarFloatSubMenuPosition();
    }
  }

  protected hideAppSidebarFloatSubMenu(): void {
    this.appSidebarFloatSubMenuHide = setTimeout(() => {
      this.appSidebarFloatSubMenu = '';
    }, this.appSidebarFloatSubMenuHideTime);
  }

  remainAppSidebarFloatSubMenu() {
    clearTimeout(this.appSidebarFloatSubMenuHide);
  }

  appSidebarSearch(e: any) {
    var targetValue = e.target.value;
    targetValue = targetValue.toLowerCase();

    if (targetValue) {
      var elms = [].slice.call(
        document.querySelectorAll(
          '.app-sidebar:not(.app-sidebar-end) .menu > .menu-item:not(.menu-profile):not(.menu-header):not(.menu-search), .app-sidebar:not(.app-sidebar-end) .menu-submenu > .menu-item'
        )
      );
      if (elms) {
        elms.map(function (elm: any) {
          elm.classList.add('d-none');
        });
      }
      var elms = [].slice.call(
        document.querySelectorAll(
          '.app-sidebar:not(.app-sidebar-end) .has-text'
        )
      );
      if (elms) {
        elms.map(function (elm: any) {
          elm.classList.remove('has-text');
        });
      }
      var elms = [].slice.call(
        document.querySelectorAll('.app-sidebar:not(.app-sidebar-end) .expand')
      );
      if (elms) {
        elms.map(function (elm: any) {
          elm.classList.remove('expand');
        });
      }
      var elms = [].slice.call(
        document.querySelectorAll(
          '.app-sidebar:not(.app-sidebar-end) .menu > .menu-item:not(.menu-profile):not(.menu-header):not(.menu-search) > .menu-link, .app-sidebar .menu-submenu > .menu-item > .menu-link'
        )
      );
      if (elms) {
        elms.map(function (elm: any) {
          var targetText = elm.textContent;
          targetText = targetText.toLowerCase();
          if (targetText.search(targetValue) > -1) {
            var targetElm = elm.closest('.menu-item');
            if (targetElm) {
              targetElm.classList.remove('d-none');
              targetElm.classList.add('has-text');
            }

            var targetElm = elm.closest('.menu-item.has-sub');
            if (targetElm) {
              var targetElm = targetElm.querySelector(
                '.menu-submenu .menu-item.d-none'
              );
              if (targetElm) {
                targetElm.classList.remove('d-none');
              }
            }

            var targetElm = elm.closest('.menu-submenu');
            if (targetElm) {
              targetElm.style.display = 'block';

              var targetElm = targetElm.querySelector(
                '.menu-item:not(.has-text)'
              );
              if (targetElm) {
                targetElm.classList.add('d-none');
              }

              var targetElm = elm.closest('.has-sub:not(.has-text)');
              if (targetElm) {
                targetElm.classList.remove('d-none');
                targetElm.classList.add('expand');

                var targetElm = targetElm.closest('.has-sub:not(.has-text)');
                if (targetElm) {
                  targetElm.classList.remove('d-none');
                  targetElm.classList.add('expand');
                }
              }
            }
          }
        });
      }
    } else {
      var elms = [].slice.call(
        document.querySelectorAll(
          '.app-sidebar:not(.app-sidebar-end) .menu > .menu-item:not(.menu-profile):not(.menu-header):not(.menu-search).has-sub .menu-submenu'
        )
      );
      if (elms) {
        elms.map(function (elm: any) {
          elm.removeAttribute('style');
        });
      }

      var elms = [].slice.call(
        document.querySelectorAll(
          '.app-sidebar:not(.app-sidebar-end) .menu > .menu-item:not(.menu-profile):not(.menu-header):not(.menu-search)'
        )
      );
      if (elms) {
        elms.map(function (elm: any) {
          elm.classList.remove('d-none');
        });
      }

      var elms = [].slice.call(
        document.querySelectorAll(
          '.app-sidebar:not(.app-sidebar-end) .menu-submenu > .menu-item'
        )
      );
      if (elms) {
        elms.map(function (elm: any) {
          elm.classList.remove('d-none');
        });
      }

      var elms = [].slice.call(
        document.querySelectorAll('.app-sidebar:not(.app-sidebar-end) .expand')
      );
      if (elms) {
        elms.map(function (elm: any) {
          elm.classList.remove('expand');
        });
      }
    }
  }

  @HostListener('scroll', ['$event'])
  onScroll(event: any) {
    this.scrollTop = this.appSettings.appSidebarMinified
      ? event.srcElement.scrollTop + 40
      : 0;
    if (typeof Storage !== 'undefined') {
      localStorage.setItem('sidebarScroll', event.srcElement.scrollTop);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (window.innerWidth <= 767) {
      this.mobileMode = true;
      this.desktopMode = false;
    } else {
      this.mobileMode = false;
      this.desktopMode = true;
    }
  }

  ngAfterViewChecked() {
    // if (typeof Storage !== 'undefined' && localStorage.sidebarScroll) {
    //   if (this.sidebarScrollbar && this.sidebarScrollbar.nativeElement) {
    //     this.sidebarScrollbar.nativeElement.scrollTop =
    //       localStorage.sidebarScroll;
    //   }
    // }
  }

  ngAfterViewInit() {
    var handleSidebarMenuToggle = function (menus: any, expandTime: any) {
      menus.map(function (menu: any) {
        menu.onclick = function (e: any) {
          e.preventDefault();
          var target = this.nextElementSibling;

          menus.map(function (m: any) {
            var otherTarget = m.nextElementSibling;
            if (otherTarget !== target) {
              slideUp(otherTarget, expandTime);
              otherTarget.closest('.menu-item').classList.remove('expand');
              otherTarget.closest('.menu-item').classList.add('closed');
            }
          });

          var targetItemElm: any;
          if (target) {
            targetItemElm = target.closest('.menu-item');

            if (
              targetItemElm.classList.contains('expand') ||
              (targetItemElm.classList.contains('active') &&
                !target.style.display)
            ) {
              targetItemElm.classList.remove('expand');
              targetItemElm.classList.add('closed');
              slideToggle(target, expandTime);
            } else {
              targetItemElm.classList.add('expand');
              targetItemElm.classList.remove('closed');
              slideToggle(target, expandTime);
            }
          }
        };
      });
    };

    var targetSidebar = document.querySelector(
      '.app-sidebar:not(.app-sidebar-end)'
    );
    var expandTime =
      targetSidebar &&
      targetSidebar.getAttribute('data-disable-slide-animation')
        ? 0
        : 300;
    var disableAutoCollapse =
      targetSidebar && targetSidebar.getAttribute('data-disable-auto-collapse')
        ? 1
        : 0;

    var menuBaseSelector = '.app-sidebar .menu > .menu-item.has-sub';
    var submenuBaseSelector = ' > .menu-submenu > .menu-item.has-sub';

    // menu
    var menuLinkSelector = menuBaseSelector + ' > .menu-link';
    var menus = [].slice.call(document.querySelectorAll(menuLinkSelector));
    handleSidebarMenuToggle(menus, expandTime);

    // submenu lvl 1
    var submenuLvl1Selector = menuBaseSelector + submenuBaseSelector;
    var submenusLvl1 = [].slice.call(
      document.querySelectorAll(submenuLvl1Selector + ' > .menu-link')
    );
    handleSidebarMenuToggle(submenusLvl1, expandTime);

    // submenu lvl 2
    var submenuLvl2Selector =
      menuBaseSelector + submenuBaseSelector + submenuBaseSelector;
    var submenusLvl2 = [].slice.call(
      document.querySelectorAll(submenuLvl2Selector + ' > .menu-link')
    );
    handleSidebarMenuToggle(submenusLvl2, expandTime);
  }

  expandCollapseSubmenu(e: any, currentMenu: any, allMenu: any, active: any) {
    e.preventDefault();
    var targetItem = e.target.closest('.menu-item');
    var target = <HTMLElement>targetItem.querySelector('.menu-submenu');
    slideToggle(target);
    // this.calculateFloatSubMenuPosition.emit();
  }

  remainMenu() {
    // this.remainAppSidebarFloatSubMenu.emit(true);
  }

  hideMenu() {
    // this.hideAppSidebarFloatSubMenu.emit(true);
  }
  protected alternarMenu(): void {
    this.alternarClicado.emit();
  }

  protected criarNovoProcesso(): void {
    const rotaAtual: string = this.router.url;

    this.validaComponentService.liberar(true);

    this.dataService.guardarObjeto({
      rota: rotaAtual,
      recipiente: 'processo',
    });
    this.router.navigate(['processo/todos/criar']);
  }

  protected acessoRouterLink(menu: any): string {
    if (menu.url === 'cliente')
      this.validaComponentService.liberar(this.acessoAdministrador);

    return menu.url;
  }

  private ocultarItensMenus(acesso: boolean): void {
    if (!acesso) {
      const administrativoIndex = this.menus.findIndex(
        (menu) => menu.title === 'Administrativo'
      );
      if (
        administrativoIndex !== -1 &&
        this.menus[administrativoIndex].submenu
      ) {
        const clienteIndex = this.menus[administrativoIndex].submenu.findIndex(
          (item) => item.url === 'cliente'
        );
        if (clienteIndex !== -1) {
          this.menus[administrativoIndex].submenu[clienteIndex].hide = 'true';
        }
      }
    }
  }
}
