package com.huzurapp.android;

import com.google.firebase.appcheck.AppCheckProviderFactory;
import com.google.firebase.appcheck.debug.DebugAppCheckProviderFactory;

public final class AppCheckProviderResolver {
    private AppCheckProviderResolver() {
    }

    public static AppCheckProviderFactory getFactory() {
        return DebugAppCheckProviderFactory.getInstance();
    }
}
