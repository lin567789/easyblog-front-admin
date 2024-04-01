import { createRouter, createWebHistory } from 'vue-router'
import VueCookies from 'vue-cookies'
const routes = [
    {
        name: '登录',
        path:'/login',
        component:()=>import('../views/Login.vue')
    }, {
        name: '框架页',
        path:'/',
        component: () => import('../views/FrameWork.vue'),
        // 重定向
        redirect:'/blog/list',
        children: [
            {
                name:'测试',
                path: '/blog/test',
                component:()=>import('../views/blog/Test.vue'),
            },
            {
                name:'博客管理',
                path: '/blog/list',
                component:()=>import('../views/blog/BlogList.vue'),
            },
            {
                name:'分类管理',
                path: '/blog/category',
                component:()=>import('../views/blog/BlogCategory.vue'),
            },
            {
                name:'专题管理',
                path: '/special/list',
                component:()=>import('../views/special/SpecialList.vue'),
            },
            {
                name:'个人信息',
                path: '/settings/my',
                component:()=>import('../views/settings/MyInfo.vue'),
        },
        {
            name:'博客成员',
            path: '/settings/teamUser',
            component:()=>import('../views/settings/TeamUser.vue'),
            },
            {
                name:'系统设置',
                path: '/settings/sysSetting',
                component:()=>import('../views/settings/SysSetting.vue'),
            },
            {
                name:'回收站',
                path: '/recovery/list',
                component:()=>import('../views/recovery/RecoveryList.vue'),
        }


        ]
    }
];

//这里不是通过new来创建，通过createRouter 方法创建，使用的模式不是通过mode来定义
const router = createRouter({
    routes,
    history: createWebHistory(),
})

router.beforeEach((to, from, next) => {
    const userInfo = VueCookies.get('userInfo');
    if (!userInfo && to.path !== '/login') {
        router.push('login');
    } else {
        next();
    }
})

export default router